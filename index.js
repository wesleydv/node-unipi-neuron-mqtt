"use strict";

let yaml          = require('js-yaml');
let fs            = require('fs');

let Mqtt          = require('mqtt');
let BoardManager  = require('unipi-neuron');

let config        = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));

let mqtt          = Mqtt.connect(config.mqtt);
let boardManager  = new BoardManager(config.boards);

let state          = {};

boardManager.on('update', function (id, value) {
    console.log(id + ' changed to ' + value);
    mqtt.publish('neuron/' + id, value);

    value = parseInt(value);
    let now = new Date().getTime();
    if (!state.hasOwnProperty(id)) {
        state[id] = {
            value: value,
            timeHigh: 0,
            timeLow: 0,
        };
    }
    else {
        state[id].value = value;
    }

    let diff = 0;
    if (value) {
        diff = now - state[id].timeHigh;
        state[id].timeHigh = now;
    }
    else {
        diff = now - state[id].timeLow;
        state[id].timeLow = now;
    }

    if (diff < 1000) {
        mqtt.publish('neuron/' + id + '/double', value.toString());
    }
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
        let value = !boardManager.getState(id);

        try {
            boardManager.set(id, value);
        }
        catch (err) {
            console.log(err.message);
            console.log('Failed to set ID: ' + id + ' to ' + value);
        }
    }
    else if (topic.substr(-5) === 'pulse') {
        let id = topic.split('/')[1];

        try {
            let time = parseInt(message);
            if (!Number.isInteger(time)) {
                time = 1000;
            }
            boardManager.set(id, true);
            setTimeout(function () {
                boardManager.set(id, false);
            }, time);
        }
        catch (err) {
            console.log(err.message);
            console.log('Failed to pulse ID: ' + id);
        }
    }
});

setTimeout(function() {
    console.log(boardManager.getAllStates());
    console.log(boardManager.getAllCounts());
}, 1000);
