#!/usr/bin/python
# -*- coding: UTF-8 -*-
 
import thread
import time
import paho.mqtt.client as mqtt
import json

payload = ""
flag_r = 0   # flag_r = 0 Not receive | flag_r = 1 receive authentication | flag_r = 2 receive information

def on_connect(mqttc, obj, flags, rc):
    if rc == 0:
        print("Connected to %s:%s" % (mqttc._host, mqttc._port))
    else:
        print("Bad connection Returned code=", rc)

def on_message(mqttc, obj, msg):
    global payload
    global flag_r
    #payload = json.loads(msg.payload)
    payload = msg.payload
    print("Type = ")
    print(type(payload))
    print("On message!")
    if str(msg.topic) == "payment-1":
        flag_r = 1
    elif str(msg.topic) == "payment-2":
        flag_r = 2
    if str(msg.topic) == "payment-3":
        flag_r = 3
    else:
        print("No such channel")
    
def on_publish(mqttc, obj, mid):
    print("mid:"+str(mid))

def on_subscribe(mqttc, obj, mid, granted_qos):
    print("Subscribed: "+str(mid)+" "+str(granted_qos))

def on_log(mqttc, obj, level, string):
    print(string)


def mqtt_receive(Name):
    mqttr = mqtt.Client()
    mqttr.on_message = on_message
    mqttr.on_connect = on_connect
    mqttr.on_publish = on_publish
    mqttr.on_subscribe = on_subscribe

    mqttr.connect("192.168.100.65", 1883, 60)
    time.sleep(3)
    mqttr.subscribe("payment-1")    
    mqttr.subscribe("payment-2")
    mqttr.subscribe("payment-3")
    mqttr.loop_start()
    print('\n')
    time.sleep(36000)
    mqttr.loop_stop()


def mqtt_publish(Name):
    mqttp = mqtt.Client()
    mqttp.on_connect = on_connect
    mqttp.on_publish = on_publish
    mqttp.connect("192.168.100.1", 1883, 60)
    time.sleep(3)
    mqttp.subscribe("charger/charger_information")
    mqttp.subscribe("charger/authentication")
    global flag_r
    mqttp.loop_start()
    print('\n')
    while True:
        if flag_r == 1:
            mqttp.publish("charger/authentication", payload)
            flag_r = 0
        elif flag_r == 2:
            mqttp.publish("charger/charger_information", payload)
            flag_r = 0

    time.sleep(36000)
    mqttp.loop_stop()

try:
   thread.start_new_thread(mqtt_receive,("Thread-1",))
   thread.start_new_thread(mqtt_publish,("Thread-2",))
except Exception as e:
   print e
 
while 1:
   pass


