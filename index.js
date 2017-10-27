"use strict";

let yaml          = require('js-yaml');
let fs            = require('fs');

let Mqtt          = require('mqtt');
let BoardManager  = require('unipi-neuron');

let config        = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));

let mqtt          = Mqtt.connect(config.mqtt);
let boardManager  = new BoardManager(config.boards);

boardManager.on('update', function (id, value) {
    console.log(id + ' changed to ' + value);
    mqtt.publish('neuron/' + id, value);
});

mqtt.on('connect', function () {
    mqtt.subscribe('neuron/#');
});

mqtt.on('message', function (topic, message) {
    if (topic.substr(-3) === 'set') {
        let id = topic.split('/')[1];
        message = message.toString();
        let value = message === 'true' || message === '1' || message === 1 || message === 'ON';
        try {
            boardManager.set(id, value);
        }
        catch (err) {
            console.log(err.message);
            console.log('Failed to set ID: ' + id + ' to ' + value);
        }
    }
    else if (topic.substr(-6) === 'switch') {
        let id = topic.split('/')[1];
        let value = !boardManager.get(id);

        try {
            boardManager.set(id, value);
        }
        catch (err) {
            console.log(err.message);
            console.log('Failed to set ID: ' + id + ' to ' + value);
        }
    }
});

setTimeout(function() {
    console.log(boardManager.getAll());
}, 1000);
