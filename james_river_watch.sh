#!/bin/bash

set -eu -o pipefail

now=$(date +%FT%T)
server="https://services7.arcgis.com/9ZKA6C4VwqZYRSvM/ArcGIS/rest/services/River_Watch_data_with_station_locations/FeatureServer/0"

esri2geojson "$server" data/james_river_watch/$now.geojson
ln -sf ./james_river_watch/$now.geojson data/james_river_watch.geojson
