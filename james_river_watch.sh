#!/bin/bash

set -eu -o pipefail

now=$(date +%FT%T)
lastmonth=$(date -d "1 month ago" +"%Y-%m-%d %T")
server="https://services7.arcgis.com/9ZKA6C4VwqZYRSvM/ArcGIS/rest/services/River_Watch_data_with_station_locations/FeatureServer/0"

# pull entries from the last month, within bbox
esri2geojson -p "where=creationdate>= TIMESTAMP '$lastmonth'" -p "geometry=-77.567939,37.494064,-77.363834,37.598184" -p "inSR=4326" "$server" data/james_river_watch/$now.geojson
ln -sf ./james_river_watch/$now.geojson data/james_river_watch.geojson
