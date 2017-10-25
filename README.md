# MQTT UniPi Neuron

MQTT communication with a UniPi Nueron device.

This is an example implementation of the [UniPi-neuron](https://github.com/wesleydv/node-unipi-neuron) node package.

### Install

1. Install the TCP Modbus server as described on their [README.md](https://github.com/UniPiTechnology/neuron_tcp_modbus_overlay)

2. Install a MQTT server like [Mosquitto](https://mosquitto.org)

3. Download or clone this repository, and run this command: `npm install`

4. Copy config.example.yml to example.yml and adjust to your needs see [UniPi-neuron](https://github.com/wesleydv/node-unipi-neuron)
for more details on the config options.

5. run `node index.js`
