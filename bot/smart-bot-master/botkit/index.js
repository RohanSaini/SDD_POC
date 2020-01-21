const { Botkit } = require('botkit');
const { WebAdapter } = require('botbuilder-adapter-web');

// Create new web adapter for connecting over WebSocket/WebHook to Botkit
const adapter = new WebAdapter({});

// Create new Botkit controller
const controller = new Botkit({
  webhook_uri: '/api/messages',
  adapter: adapter
});

controller.ready(() => {
	// Load conversation modules into controller
	controller.loadModules(__dirname + '/features');
  console.log('Botkit started');
});

module.exports = controller;
