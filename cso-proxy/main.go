package main

import (
	"crypto/tls"
	_ "embed"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"sync"
	"time"
)

// Site represents the metadata for a monitoring site.
type Site struct {
	Name             string `json:"name"`
	Note             string `json:"note"`
	Bodies           string `json:"bodies"`
	SiteType         string `json:"site_type"`
	AnalysisConfigID int    `json:"analysis_config_id"`
}

// VisualizationResponse represents the wrapper for visualization sites.
type VisualizationResponse struct {
	ID            int `json:"id"`
	Visualization struct {
		Name  string `json:"name"`
		Sites []Site `json:"sites"`
	} `json:"visualization"`
}

// AnalysisResultsData represents the inner metrics for a CSO site.
type AnalysisResultsData struct {
	CsoOccurrence     *bool   `json:"cso_occurrence"`
	CsoActiveOverflow *bool   `json:"cso_active_overflow"`
	CsoLastOccurrence *string `json:"cso_last_occurrence"`
	CurrentEventStart *string `json:"current_event_start"`
}

// SiteStatus represents the status returned by the analysis results endpoint.
type SiteStatus struct {
	AnalysisConfigurationID int    `json:"analysis_configuration_id"`
	CreatedOn               string `json:"created_on"`
	AnalysisResults         struct {
		AnalysisResults AnalysisResultsData `json:"analysis_results"`
	} `json:"analysis_results"`
}

// GeoJSONFeature represents a single feature in the GeoJSON FeatureCollection.
type GeoJSONFeature struct {
	Type       string                 `json:"type"`
	ID         string                 `json:"id,omitempty"`
	Properties map[string]interface{} `json:"properties"`
	Geometry   json.RawMessage        `json:"geometry"`
}

// GeoJSONFeatureCollection represents the entire GeoJSON collection.
type GeoJSONFeatureCollection struct {
	Type     string           `json:"type"`
	Name     string           `json:"name,omitempty"`
	CRS      json.RawMessage  `json:"crs,omitempty"`
	Features []GeoJSONFeature `json:"features"`
}

//go:embed cso.geojson
var csoGeoBytes []byte

// Global regex for cleaning names (e.g. "CSO 34" -> "CSO034").
var csoNameRegex = regexp.MustCompile(`^CSO\s+(\d+).*`)

var (
	baseFC          GeoJSONFeatureCollection
	tokenMutex      sync.RWMutex
	cachedToken     string
	cacheMutex      sync.RWMutex
	cachedGeoJSON   []byte
	cacheExpiration time.Time

	scriptRegex = regexp.MustCompile(`<script\s+[^>]*src="([^"]+)"`)
	tokenRegex  = regexp.MustCompile(`PERMANENT_TOKEN\s*:\s*["']([^"']+)["']`)
)

// cleanCsoName formats names to match ref:US-VA:rva-dpu (e.g., CSO034).
func cleanCsoName(name string) string {
	matches := csoNameRegex.FindStringSubmatch(name)
	if len(matches) < 2 {
		return name
	}
	num, err := strconv.Atoi(matches[1])
	if err != nil {
		return name
	}
	return fmt.Sprintf("CSO%03d", num)
}

// parseTime tries parsing dates with different formats.
func parseTime(tStr string) (time.Time, error) {
	if t, err := time.Parse(time.RFC3339, tStr); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02T15:04:05", tStr); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02", tStr); err == nil {
		return t, nil
	}
	return time.Time{}, fmt.Errorf("unknown time format: %s", tStr)
}

func main() {
	// Parse base GeoJSON on startup
	if err := json.Unmarshal(csoGeoBytes, &baseFC); err != nil {
		log.Fatalf("Error parsing cso.geojson: %v", err)
	}

	// Fetch CSO token on startup
	if _, err := getCSOToken(); err != nil {
		log.Printf("Warning: failed to fetch CSO token on startup: %v", err)
	}

	port := flag.Int("port", 8080, "Port to listen on")
	flag.Parse()

	// Get port from environment if available
	if envPort := os.Getenv("PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			*port = p
		}
	}

	http.HandleFunc("/cso.geojson", geoJSONHandler)
	http.HandleFunc("/geojson", geoJSONHandler)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			geoJSONHandler(w, r)
			return
		}
		http.NotFound(w, r)
	})

	log.Printf("Starting CSO GeoJSON server on :%d...", *port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", *port), nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// fetchPermanentToken dynamically scrapes the PERMANENT_TOKEN from the map app's JavaScript bundle.
func fetchPermanentToken() (string, error) {
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	targetURL := "https://apps.emnet.net/richmond-pub-map-app/?city=47&config=5c0cacee-7e95-4eea-922d-c736c83eb4b9"
	baseURL, err := url.Parse(targetURL)
	if err != nil {
		return "", fmt.Errorf("error parsing target url: %w", err)
	}

	resp, err := client.Get(targetURL)
	if err != nil {
		return "", fmt.Errorf("error fetching target url: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("fetching target url returned status code %d", resp.StatusCode)
	}

	htmlBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading target html: %w", err)
	}

	htmlContent := string(htmlBytes)
	matches := scriptRegex.FindAllStringSubmatch(htmlContent, -1)
	if len(matches) == 0 {
		return "", fmt.Errorf("no script tags with src found in html")
	}

	for _, match := range matches {
		scriptSrc := match[1]
		relURL, err := url.Parse(scriptSrc)
		if err != nil {
			continue
		}
		absURL := baseURL.ResolveReference(relURL)
		if absURL.Host != baseURL.Host {
			continue
		}

		jsResp, err := client.Get(absURL.String())
		if err != nil {
			log.Printf("Error fetching script %s: %v", absURL.String(), err)
			continue
		}
		defer jsResp.Body.Close()

		if jsResp.StatusCode != http.StatusOK {
			log.Printf("Fetching script %s returned status code %d", absURL.String(), jsResp.StatusCode)
			continue
		}

		jsBytes, err := io.ReadAll(jsResp.Body)
		if err != nil {
			log.Printf("Error reading script %s: %v", absURL.String(), err)
			continue
		}

		jsContent := string(jsBytes)
		if tokenMatch := tokenRegex.FindStringSubmatch(jsContent); len(tokenMatch) > 1 {
			return tokenMatch[1], nil
		}
	}

	return "", fmt.Errorf("PERMANENT_TOKEN not found in any referenced JS files")
}

// getCSOToken gets the Authorization token, dynamically fetching and caching it if not set.
func getCSOToken() (string, error) {
	tokenMutex.RLock()
	if cachedToken != "" {
		t := cachedToken
		tokenMutex.RUnlock()
		return t, nil
	}
	tokenMutex.RUnlock()

	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	// Double check
	if cachedToken != "" {
		return cachedToken, nil
	}

	token, err := fetchPermanentToken()
	if err != nil {
		return "", err
	}

	log.Printf("Successfully fetched CSO token")
	cachedToken = "Token " + token
	return cachedToken, nil
}

// clearCSOToken clears the cached token, forcing a refetch on the next request.
func clearCSOToken() {
	tokenMutex.Lock()
	cachedToken = ""
	tokenMutex.Unlock()
}

// geoJSONHandler processes the HTTP request to dynamically generate CSO GeoJSON.
func geoJSONHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method != "GET" {
		w.Header().Set("Allow", "GET")
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Try read lock first
	cacheMutex.RLock()
	if cachedGeoJSON != nil && time.Now().Before(cacheExpiration) {
		w.Header().Set("Content-Type", "application/geo+json")
		w.Write(cachedGeoJSON)
		cacheMutex.RUnlock()
		return
	}
	cacheMutex.RUnlock()

	// Acquire write lock to perform fetch or wait for someone else performing it
	cacheMutex.Lock()
	defer cacheMutex.Unlock()

	// Double check in case another goroutine fetched it while we were waiting
	if cachedGeoJSON != nil && time.Now().Before(cacheExpiration) {
		w.Header().Set("Content-Type", "application/geo+json")
		w.Write(cachedGeoJSON)
		return
	}

	token, err := getCSOToken()
	if err != nil {
		log.Printf("Error obtaining CSO token: %v", err)
		http.Error(w, "Failed to obtain CSO authorization token", http.StatusInternalServerError)
		return
	}



	// 2. Fetch sites list
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{
		Transport: tr,
		Timeout:   20 * time.Second,
	}

	visURL := "https://restapi.emnet.net/api/tables/visualizations/47/?uuid=5c0cacee-7e95-4eea-922d-c736c83eb4b9"
	req, err := http.NewRequestWithContext(r.Context(), "GET", visURL, nil)
	if err != nil {
		log.Printf("Error creating visualization request: %v", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", token)

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error fetching sites list: %v", err)
		http.Error(w, "Failed to connect to CSO API", http.StatusBadGateway)
		return
	}

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		log.Printf("CSO API returned authorization error: %d. Clearing cached token and retrying with fresh token...", resp.StatusCode)
		resp.Body.Close()

		clearCSOToken()
		token, err = getCSOToken()
		if err != nil {
			log.Printf("Error refreshing CSO token: %v", err)
			http.Error(w, "Failed to obtain CSO authorization token on retry", http.StatusInternalServerError)
			return
		}

		req, err = http.NewRequestWithContext(r.Context(), "GET", visURL, nil)
		if err != nil {
			log.Printf("Error creating visualization request on retry: %v", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
		req.Header.Set("Authorization", token)

		resp, err = client.Do(req)
		if err != nil {
			log.Printf("Error retrying fetch sites list: %v", err)
			http.Error(w, "Failed to connect to CSO API on retry", http.StatusBadGateway)
			return
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Visualization API returned status: %d", resp.StatusCode)
		http.Error(w, fmt.Sprintf("CSO API returned status %d", resp.StatusCode), http.StatusBadGateway)
		return
	}

	var visResp []VisualizationResponse
	if err := json.NewDecoder(resp.Body).Decode(&visResp); err != nil {
		log.Printf("Error decoding visualization response: %v", err)
		http.Error(w, "Invalid response from CSO API", http.StatusBadGateway)
		return
	}

	if len(visResp) == 0 || len(visResp[0].Visualization.Sites) == 0 {
		log.Printf("No sites found in visualization response")
		http.Error(w, "No sites configured in CSO API", http.StatusBadGateway)
		return
	}

	sites := visResp[0].Visualization.Sites
	queryTime := time.Now().UTC()
	queryTimeStr := queryTime.Format("2006-01-02T15:04:05")

	// 3. Fetch status for all sites in parallel using Goroutines
	type FetchResult struct {
		SiteID int
		Status *SiteStatus
		Err    error
	}

	resultsChan := make(chan FetchResult, len(sites))
	sem := make(chan struct{}, 10) // Limit concurrency to 10 requests

	var wg sync.WaitGroup
	for _, site := range sites {
		wg.Add(1)
		go func(s Site) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			u, err := url.Parse("https://restapi.emnet.net/api/tables/analysis-results/47/")
			if err != nil {
				resultsChan <- FetchResult{SiteID: s.AnalysisConfigID, Err: err}
				return
			}
			q := u.Query()
			q.Set("created-on", queryTimeStr)
			q.Set("analysis-configuration-id", strconv.Itoa(s.AnalysisConfigID))
			u.RawQuery = q.Encode()

			sReq, err := http.NewRequestWithContext(r.Context(), "GET", u.String(), nil)
			if err != nil {
				resultsChan <- FetchResult{SiteID: s.AnalysisConfigID, Err: err}
				return
			}
			sReq.Header.Set("Authorization", token)

			sResp, err := client.Do(sReq)
			if err != nil {
				resultsChan <- FetchResult{SiteID: s.AnalysisConfigID, Err: err}
				return
			}
			defer sResp.Body.Close()

			if sResp.StatusCode != http.StatusOK {
				resultsChan <- FetchResult{
					SiteID: s.AnalysisConfigID,
					Err:    fmt.Errorf("received status code %d", sResp.StatusCode),
				}
				return
			}

			var statuses []SiteStatus
			if err := json.NewDecoder(sResp.Body).Decode(&statuses); err != nil {
				resultsChan <- FetchResult{SiteID: s.AnalysisConfigID, Err: err}
				return
			}

			if len(statuses) == 0 {
				resultsChan <- FetchResult{
					SiteID: s.AnalysisConfigID,
					Err:    fmt.Errorf("empty status response"),
				}
				return
			}

			resultsChan <- FetchResult{SiteID: s.AnalysisConfigID, Status: &statuses[0]}
		}(site)
	}

	wg.Wait()
	close(resultsChan)

	// Map to store site dynamic data indexed by cleaned name
	type CsoMergedData struct {
		Name         string
		SiteType     string
		CsoNow       *bool
		CsoActive    *bool
		CsoLast      *string
		CsoStart     *string
		CreatedOn    *string
		QueryTime    string
		DaysSinceCso *float64
		CsoRecent    *bool
	}
	csoMap := make(map[string]CsoMergedData)

	for res := range resultsChan {
		// Find the site details matching this config ID
		var site Site
		found := false
		for _, s := range sites {
			if s.AnalysisConfigID == res.SiteID {
				site = s
				found = true
				break
			}
		}

		if !found {
			continue
		}

		cleanedName := cleanCsoName(site.Name)

		if res.Err != nil {
			log.Printf("Error fetching site status for %s (%d): %v", site.Name, res.SiteID, res.Err)
			// Put empty/nil placeholder or skip?
			// Let's populate what we can, setting status values to nil.
			csoMap[cleanedName] = CsoMergedData{
				Name:      cleanedName,
				SiteType:  site.SiteType,
				QueryTime: queryTimeStr,
			}
			continue
		}

		status := res.Status
		stats := status.AnalysisResults.AnalysisResults

		var daysSinceCso *float64
		var csoRecent *bool
		if stats.CsoLastOccurrence != nil {
			if lastTime, err := parseTime(*stats.CsoLastOccurrence); err == nil {
				diff := queryTime.Sub(lastTime)
				days := diff.Hours() / 24.0
				daysSinceCso = &days
				recent := days <= 2.0
				csoRecent = &recent
			}
		}

		var createdOn *string
		if status.CreatedOn != "" {
			createdOn = &status.CreatedOn
		}

		csoMap[cleanedName] = CsoMergedData{
			Name:         cleanedName,
			SiteType:     site.SiteType,
			CsoNow:       stats.CsoOccurrence,
			CsoActive:    stats.CsoActiveOverflow,
			CsoLast:      stats.CsoLastOccurrence,
			CsoStart:     stats.CurrentEventStart,
			CreatedOn:    createdOn,
			QueryTime:    queryTimeStr,
			DaysSinceCso: daysSinceCso,
			CsoRecent:    csoRecent,
		}
	}

	// 4. Merge with base GeoJSON features (inner join by name)
	var outFeatures []GeoJSONFeature

	for _, feat := range baseFC.Features {
		refVal, exists := feat.Properties["ref:US-VA:rva-dpu"]
		if !exists {
			continue
		}
		refStr, ok := refVal.(string)
		if !ok {
			continue
		}

		// Look up in our dynamic data map
		dynData, found := csoMap[refStr]
		if !found {
			// Inner join: skip if not found in API results
			continue
		}

		// Create merged properties map
		newProps := make(map[string]interface{})

		// Copy existing properties, ignoring "layer" and "name"
		for k, v := range feat.Properties {
			if k == "layer" || k == "name" {
				continue
			}
			newProps[k] = v
		}

		// If there is an ID at the top level of the feature, make sure "id" property has it
		if feat.ID != "" {
			newProps["id"] = feat.ID
		}

		// Add dynamic CSO properties
		newProps["name"] = dynData.Name
		newProps["site_type"] = dynData.SiteType
		newProps["cso_now"] = dynData.CsoNow
		newProps["cso_active"] = dynData.CsoActive
		newProps["cso_last"] = dynData.CsoLast
		newProps["cso_start"] = dynData.CsoStart
		newProps["created_on"] = dynData.CreatedOn
		newProps["query_time"] = dynData.QueryTime
		newProps["days_since_cso"] = dynData.DaysSinceCso
		newProps["cso_recent"] = dynData.CsoRecent

		// Construct final feature
		outFeat := GeoJSONFeature{
			Type:       feat.Type,
			ID:         feat.ID,
			Properties: newProps,
			Geometry:   feat.Geometry,
		}
		outFeatures = append(outFeatures, outFeat)
	}

	outFC := GeoJSONFeatureCollection{
		Type:     "FeatureCollection",
		Name:     "cso_overflow",
		CRS:      baseFC.CRS,
		Features: outFeatures,
	}

	responseBytes, err := json.Marshal(outFC)
	if err != nil {
		log.Printf("Error marshaling response GeoJSON: %v", err)
		http.Error(w, "Internal server error encoding GeoJSON", http.StatusInternalServerError)
		return
	}

	cachedGeoJSON = responseBytes
	cacheExpiration = time.Now().Add(1 * time.Hour)

	w.Header().Set("Content-Type", "application/geo+json")
	w.Write(responseBytes)
}
