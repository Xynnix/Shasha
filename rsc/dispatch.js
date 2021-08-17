
const configFile = require('../config.json');
const { join } = require('path');
const requireAll = require("require-all");
const { Client } = require('discord.js');

/**
 * @param {Client} client 
 */
function dispatch(client) {
    client.eventHandlers = requireAll({ dirname: join(__dirname, "eventHandlers") });
    client.commands = requireAll({ dirname: join(__dirname, "cmds"), recursive: true });
    let count = 0;
    for (const U in client.eventHandlers) {
        client.on(U, async (...args) => {
            client.eventHandlers[U].handle(client, ...args);
        });
        count++;
    }
    console.log(count, "listeners loaded.");
}

module.exports = { dispatch }