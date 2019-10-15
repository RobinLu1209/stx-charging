# stx-charging
Contactless Charging Payment for EV-car based on StarlingX

## Network configuration
![System block diagram](https://github.com/RobinLu1209/stx-charging/blob/master/block_diagram.png)

#### How to set up a jumper
```
1. Check for the dev_id of the jumper network with "ifconfig" or "ip addr".
2. Set gateway addr:
sudo ip addr add 10.10.10.1/24 dev <dev_id for the jumper network>
3. Set iptables to allow post routing.
sudo iptables -t nat -A POSTROUTING -s 10.10.10.0/24 -j MASQUERADE
4. Check the iptables.
sudo iptables -t nat -L
Make sure you see this:
MASQUERADE all -- 10.10.10.0/24 anywhere
```

#### How to link one device to the jumper
```
sudo ip address add 10.10.10.3/24 dev <dev_id for the device>
sudo ip link set up dev<dev_id for the device>
sudo route add default gw 10.10.10.1 dev<dev_id for the device>
```

## How to run

#### Docker
For StarlingX-VM:
```bash
#mqtt-hivemq:
docker run --rm --name mqtt -d -p 1883:1883 -p 8880:8080 -p 8881:8081 -v ~/workspace/stx/hivemq.conf:/opt/hivemq-3.4.3/conf/config.xml -t hivemq/hivemq3:3.4.3

#mqtt-nginx:
docker run --rm --name www -d -p 8000:80 -v ~/workspace/www/:/usr/share/nginx/html:ro -it nginx:stable
```
For Jumper:
```bash
#mqtt-mosquitto
sudo docker run --rm -e LANG=C.UTF-8 -d --privileged --network host edgehost01.sh.intel.com:5000/eclipse-mosquitto:latest
```

#### Command Line
For Raspberry:
```
ssh pi@192.168.100.100
cd workspace
./start.sh 192.168.100.65 2
python socket_recv.py
```
For [Payment](https://github.com/ZhaiMengdong/Contactless-Payment-Control):
```
ssh sysadmin@192.168.100.60
cd Contactless-Payment-Control
./build/output/samples/MQTTClient_publish
```
For StarlingX-VM
```
ssh sysadmin@192.168.100.65
cd workspace
python mqtt_thread.py
```
For Jumper
```
cd workspace/lubin/src/parking_mgmt_webui/jumper/webUI
python app_lubin.py
```

