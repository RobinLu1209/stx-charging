#!/bin/bash

#don't run as root

MQTT_HOST=$1
STATION_ID=$2

#MQTT_HOST = "192.168.100.65"
#STATION_ID = "2"

TIMEOUT=3
INTERVAL=1
CHARGING_SPEED=15

# state machine
# idle => attached => charging => completed => detached => idle
#                     |     ^                               ^
#                     V     |                               |
#              detached => attached                         |
#                     |                                     |
#                     V                                     |
#                 timeout => completed ----------------------

STATUS_IDLE='idle'
STATUS_ATTACHED='attached'
STATUS_CHARGING='charging'
STATUS_COMPLETED='completed'
STATUS_DETACHED='detached'

function mqtt_public()
{
    local id=$1
    local status=$2
    local energy=$3
    local total_energy=$4
    local mytime=$(date "+%Y%m%d%H%M%S")
    local progress=`expr $energy \* 100 / $total_energy`
    local pay=`expr $energy / 10 + 5`
    local license="沪AIoT888"
    echo "mqtt_public: $id, $status, $energy, $total_energy"
    python3 - <<__EOF__
import paho.mqtt.publish as publish
publish.single("payment-$STATION_ID","""{"id":"$id","status":"$status","energy":"$energy","total_energy":"$total_energy","progress":"$progress","pay":"$pay","license":"$license","mytime":"$mytime"}""",hostname="$MQTT_HOST")
__EOF__

    python - <<__EOF__
import thread
import socket

def socket_send():
    if("$status" == "attached"):
	print("attached, socket send authen")
        s1 = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        s1.connect(('192.168.100.60',9988))
    
        cmd = "{\"title\":   \"Vin\", \"properties\": {\"vendorId\": \"4179187517\", \"data\": \"LSGJA52U1BH003531\"}}"
        s1.sendall(cmd)
        s1.close()

    elif("$status" == "completed"):
        print("completed, send pay")
        s2 = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        s2.connect(('192.168.100.60',9998))
        cmd = "{\"title\":  \"pay\",\"properties\":{\"meterStop\":\"30\",\"vendorId\":\"4179187517\",\"reason\":\"EVDisconnected\",\"transactionData\":{\"sampledValue\":{\"items\":{\"location\":\"114.064506,22.549258\"}}}}}"
        s2.sendall(cmd)
        s2.close()


def socket_recv():
    s3 = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    s3.bind('192.168.100.60',9978)
    s3.listen(5)
    while 1:
	connection,addr = s3.accept()
        try:
            connection.settimeout(50)
            while True:
                buf = connection.recv(1024)
                print('recieved:', buf)
        except s3.timeout:
            print('time out')
        connection.close()
    

try:
    socket_send()
except Exception as e:
   print e




__EOF__
}

function read_id()
{
    python3 - <<__EOF__
import os
tty = os.open("/dev/ttyACM0", os.O_RDWR)
os.write(tty, b"id")
id = os.read(tty, 24).decode(encoding='utf-8')
print(id)
__EOF__
}

function ev_detect()
{
    local id="none"

    if [ -e /dev/ttyACM0 ]; then
        sleep 0.1
        stty -F /dev/ttyACM0 -icanon || return $id
	id=`read_id 2>/dev/null` || return $id
    fi
    echo $id
}

function ev_wait_timeout()
{
    local id=$1
    local cur=`ev_detect`
    local timeout=0

    while [ "$id" != "$cur" ] && [ "$timeout" -lt "$TIMEOUT"  ]; do
        sleep $INTERVAL
        cur=`ev_detect`
        let "timeout++"
    done

    if [ "$id" = "$cur" ]; then
        return 0 #true
    else
        return 1 #false
    fi
}



function ev_charging_process()
{
    local id=$1
    local energy=0
    local speed=15 #hard code for demo
    local total_energy=75 #hard code to 75 without detect for demo
    local timeout
    local cur

    mqtt_public $id $STATUS_ATTACHED $energy $total_energy
    while [ "$energy" -lt "$total_energy"  ]; do
        let "energy+=speed"
        mqtt_public $id $STATUS_CHARGING $energy $total_energy
        sleep $INTERVAL

        timeout=0
        cur=`ev_detect`
        while [ "$id" != "$cur" ] && [ "$timeout" -lt "$TIMEOUT"  ]; do
            mqtt_public $id $STATUS_DETACHED $energy $total_energy
            sleep $INTERVAL
            cur=`ev_detect`
            let "timeout++"
        done
        if [ "$id" != "$cur" ]; then
	    mqtt_public $id $STATUS_COMPLETED $energy $total_energy
	    sleep 3
	    mqtt_public $id $STATUS_IDLE $energy $total_energy
	    return 0
        fi
    done
    mqtt_public $id $STATUS_COMPLETED $energy $total_energy

    timeout=0
    cur=`ev_detect`
    while [ "$id" = "$cur" ]; do
        sleep $INTERVAL
        cur=`ev_detect`
    done
    mqtt_public $id $STATUS_DETACHED $energy $total_energy
    mqtt_public $id $STATUS_IDLE $energy $total_energy
}

while true; do
    id=`ev_detect`
    if [ "$id" != "none" ]; then
	echo "id: $id"
        ev_charging_process $id
    fi
done

