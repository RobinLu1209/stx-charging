#!/usr/bin/python
# -*- coding: utf-8 -*-

# Using MQTT to publish charger information

import time
import paho.mqtt.client as mqtt
import json
import argparse

SERVER="10.10.10.3"
PORT=31883
CHANNEL="unionpay/e_charger"
MSG=""

#############################################################################
# Call back functions def
def on_connect(mqttc, obj, flags, rc):
    if rc == 0:
        print("Connected to %s:%s" % (mqttc._host, mqttc._port))
        print("Trying to subscribe on %s" % CHANNEL)
        mqttc.subscribe(args.channel)
    else:
        print("Bad connection Returned code=", rc)


def on_message(mqttc, obj, msg):
    #payload = json.loads(str(msg.payload)[2:-1])
    print(str(msg.topic))

    payload = json.loads(str(msg.payload))
    if str(msg.topic) == CHANNEL:
        print(">>>>>>>>>>>>> Report status: %s" % payload)
        print('\n')


def on_publish(mqttc, obj, mid):
    print("mid:"+str(mid))


def on_subscribe(mqttc, obj, mid, granted_qos):
    print("Subscribed: "+str(mid)+" "+str(granted_qos))
    print("Trying to send message on this channel.")
    payload = json.dumps(MSG)
    mqttc.publish(CHANNEL, payload)


def on_log(mqttc, obj, level, string):
    print(string)
#############################################################################

desc = "MQTT E-charger Publish Test"
parser = argparse.ArgumentParser(description=desc, version='%(prog)s 1.0')

parser.add_argument('message',
    help="Message",
    type=str)

MSG = args.message

mqttc = mqtt.Client()
mqttc.on_message = on_message
mqttc.on_connect = on_connect
mqttc.on_publish = on_publish
mqttc.on_subscribe = on_subscribe

# mqttc.connect("198.41.30.241", 1883, 60)
print("Connect to %s:%d" % (SERVER, PORT))
mqttc.connect(SERVER, PORT, 60)

mqttc.loop_start()
print('\n')
# Wait for connection setup to complete Other code here
time.sleep(10)
mqttc.loop_stop()





