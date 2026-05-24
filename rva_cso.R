library(httr2)
library(dplyr)
library(sf)

# Cheat and use Overpass export for CSO locations
cso_geo <- read_sf('cso.geojson')

# API base + "auth"
api_base <- request("https://restapi.emnet.net/api/tables") |>
  req_headers(`Authorization` = Sys.getenv("CSO_TOKEN")) |>
  req_options(ssl_verifypeer = 0)


cat("\nQuerying API for site info...\n")

# Site information
sites <- api_base |>
  req_url_path_append("visualizations/47/") |>
  req_url_query(uuid = "5c0cacee-7e95-4eea-922d-c736c83eb4b9") |>
  req_perform() |>
  resp_body_json() |>
  _[[1]]$visualization$sites |>
  lapply(data.frame) |>
  do.call(rbind, args = _)

# Speed query up by grabbing the most-recent entry (using the time right now)
query_time <- Sys.time() |>
  format("%Y-%m-%dT%H:%M:%S", tz = "UTC")

site_request_base <- api_base |>
  req_url_path_append("analysis-results/47/") |>
  req_url_query(`created-on` = query_time) |>
  req_throttle(capacity = 30, fill_time_s = 60)

cat("Querying API for current CSO status...\n")

site_data <- lapply(
  sites$analysis_config_id,
  function(site) {
    site_request_base |>
      req_url_query(`analysis-configuration-id` = site)
  }
) |>
  req_perform_parallel() |>
  lapply(function(x) resp_body_json(x))

# Parse the response
cso <- lapply(site_data, function(x) {
  cso_stats <- x[[1]]$analysis_results$analysis_results

  list(
    cso_now = cso_stats$cso_occurrence,
    cso_active = cso_stats$cso_active_overflow,
    cso_last = cso_stats$cso_last_occurrence,
    cso_start = cso_stats$current_event_start,
    analysis_config_id = x[[1]]$analysis_configuration_id,
    created_on = x[[1]]$created_on
  ) |>
    lapply(
      function(.) . <- ifelse(is.null(.), NA, .)
    ) |>
    data.frame()
}) |>
  do.call(rbind, args = _)

cat("Writing data...\n")

out_data <- merge(sites, cso)

# Clean names to match those from the Overpass query
out_data$name <- sapply(
  out_data$name,
  function(x) {
    num <- sub("^CSO\\s+(\\d+).*", "\\1", x)
    sprintf("CSO%03d", as.numeric(num))
  },
  USE.NAMES = FALSE
)
out_data$query_time <- query_time
out_data$cso_recent <- (as.POSIXct(out_data$query_time) -
  as.POSIXct(out_data$cso_last)) <
  (48 * 60 * 60)

write.table(
  out_data,
  "data/cso_log.csv",
  append = T,
  sep = ",",
  col.names = F,
  row.names = F
)

file.remove("data/cso_overflow.geojson")
merge(out_data, cso_geo, by.x = "name", by.y = "ref:US-VA:rva-dpu") |>
  select(-layer, -name.y, -note, -bodies, -analysis_config_id) |>
  st_write("data/cso_overflow.geojson")

cat("Done.\n")

### Various site metadata are hidden in here, but they aren't all that useful for this purpose.
# req_meta <- request("https://restapi.emnet.net/api/tables/inodes/47/") |>
#   req_headers(
#    `Authorization` = Sys.getenv("CSO_TOKEN")
#   ) |>
#   req_perform() |>
#   resp_body_json()

# k <- lapply(req_meta, function(x) {
#   data.frame(x)
# }) |>
#   do.call(rbind, args = _) |>
#   filter(!lon < -180, grepl("CSO", description)) |>
#   mutate(description = trimws(description)) |>
#   distinct(description, lon, lat)
