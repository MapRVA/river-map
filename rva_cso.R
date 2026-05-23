library(httr2)
library(dplyr)
library(sf)

cso_geo <- read_sf('cso.geojson') # Overpass export

sites <- request("https://restapi.emnet.net/api/tables/visualizations/47/") |>
  req_url_query(uuid = "5c0cacee-7e95-4eea-922d-c736c83eb4b9") |>
  req_headers(
    `Authorization` = Sys.getenv("CSO_TOKEN")
  ) |>
  req_perform() |>
  resp_body_json() |>
  _[[1]]$visualization$sites |>
  lapply(data.frame) |>
  do.call(rbind, args = _)

query_time <- Sys.time() |> format("%Y-%m-%dT%H:%M:%S", tz = "UTC")

site_request_base <- request(
  "https://restapi.emnet.net/api/tables/analysis-results/47/"
) |>
  req_headers(
    `Authorization` = Sys.getenv("CSO_TOKEN")
  ) |>
  req_throttle(capacity = 30, fill_time_s = 60)

site_data <- lapply(sites$analysis_config_id, function(site) {
  site_request_base |> req_url_query(`analysis-configuration-id` = site)
}) |>
  req_perform_parallel()

site_data <- lapply(site_data, function(x) resp_body_json(x))

cso <- lapply(site_data, function(x) {
  data.frame(
    cso = x[[1]]$analysis_results$analysis_results$cso_occurrence,
    analysis_config_id = x[[1]]$analysis_configuration_id
  )
}) |>
  do.call(rbind, args = _)

out_data <- merge(sites, cso)
out_data$name <- sapply(
  out_data$name,
  function(x) {
    num <- sub("^CSO\\s+(\\d+).*", "\\1", x)
    sprintf("CSO%03d", as.numeric(num))
  },
  USE.NAMES = FALSE
)

write.table(out_data, "data/cso_log.csv", append = T, sep=”,”,
            col.names = F, row.names = F)

merge(out_data, cso_geo, by.x = "name", by.y = "ref:US-VA:rva-dpu") |>
  select(-layer, -name.y, -note, -bodies, -analysis_config_id) |>
  st_write("data/cso_overflow.geojson", append = T)

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
