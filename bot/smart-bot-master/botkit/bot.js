const { Botkit } = require('botkit');
const { WebAdapter } = require('botbuilder-adapter-web');

const adapter = new WebAdapter({});
const controller = new Botkit({
  webhook_uri: '/api/messages',
  adapter: adapter
});

controller.ready(() => {
  controller.loadModules(__dirname + '/features');
  console.log('Botkit started');
});

module.exports = controller;
