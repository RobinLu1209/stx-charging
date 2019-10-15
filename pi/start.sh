#!/bin/bash -e

# example: ./start.sh 10.239.142.248 2 10.239.142.248:5912

MQTT_HOST=$1
STATION_ID=$2

./ev_charging_service.sh $MQTT_HOST $STATION_ID

