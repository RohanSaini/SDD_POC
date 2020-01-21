const Handlebars = require('handlebars');
const showdown = require('showdown');
const fs = require('fs');

// Register Handlebars helpers
require('./helpers/hbsHelpers')(Handlebars);

// Import Handlebars templates
const hbsTemplates = require('../hbs')(Handlebars);

// Import TextToSpeech class
const TextToSpeech = require('./text-to-speech');
// Create new TextToSpeech instance 
// params (muted?: Boolean)
// NOTE: tts can be toggled with the UI toggler irrespective of the default state
let tts = new TextToSpeech(true);

// Create new Showdown convertor with config
var converter = new showdown.Converter({
	headerLevelStart: 3,
	openLinksInNewWindow: true
});

const registerEventHandlers = () => {
	document.querySelector('#home_btn').addEventListener('click', function (ev) {
		Botkit.send('exit');
	});
};

/**
 * Initializes the app.
 * Adds 'initUpdate' event listener to window (emitted from main process).
 * Intimates user of initialization status of various services/child_processes.
 */
const initialize = async () => {
	window.addEventListener('initUpdate', (event) => {
		const { processes, processStatus } = event.detail;
		const statusDivString = '_status_div';
		let startChat = true;
		Object.keys(processes).forEach(param => {
			const process = processes[param];
			const id = param + statusDivString;
			const innerHtml = hbsTemplates.initialization_status({ process, processStatus });
			let statusDiv = document.getElementById(id);
			if (statusDiv) {
				statusDiv.innerHTML = innerHtml;
			} else if (process.status !== process.initialized) {
				statusDiv = document.createElement('div');
				statusDiv.id = id;
				statusDiv.innerHTML = innerHtml;
				document.getElementById('initialization_status_box').appendChild(statusDiv);
			}
			if (process.status === processStatus.initialized) {
				setTimeout(() => statusDiv.remove(), 3000);
			}
			startChat = startChat && (processes[param].status === processStatus.initialized);
		});
		if (startChat) {
			Botkit.boot();
			registerEventHandlers();
		}
	});
};


var Client = {
	saveResponseFeedback: function (ev) {
		$('#collapseOne').collapse('hide');
		var userResponse = {
			userQuestion: Botkit.last_user_message.text,
			botResponse: Botkit.bot_restanswer[0]._source.doc,
			userFeedback: document.querySelector('input[name="restanswer_feedback"]:checked').value
		};
		var feedbackFile = 'userfeedback.json';
		var userFeedbackFile = JSON.parse(fs.readFileSync(feedbackFile).toString());
		userFeedbackFile.feedback.push(userResponse);
		console.log(userFeedbackFile);
		fs.writeFileSync(feedbackFile, JSON.stringify(userFeedbackFile));
	}
};

var Botkit = {
	config: {
		ws_url:
			(window.location.protocol === 'https:' ? 'wss' : 'ws') +
			'://' +
      /* window.location.host */ 'localhost:3000',
		reconnect_timeout: 3000,
		max_reconnect: 5,
		enable_history: false
	},
	options: {
		use_sockets: true
	},
	reconnect_count: 0,
	guid: null,
	current_user: null,
	last_user_message: null,
	bot_restanswer: null,
	on: function (event, handler) {
		this.message_window.addEventListener(event, function (evt) {
			handler(evt.detail);
		});
	},
	trigger: function (event, details) {
		var event = new CustomEvent(event, {
			detail: details
		});
		this.message_window.dispatchEvent(event);
	},
	request: function (url, body) {
		var that = this;
		return new Promise(function (resolve, reject) {
			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == XMLHttpRequest.DONE) {
					if (xmlhttp.status == 200) {
						var response = xmlhttp.responseText;
						if (response != '') {
							var message = null;
							try {
								message = JSON.parse(response);
							} catch (err) {
								reject(err);
								return;
							}
							// console.log("this message will get rendered 3 =>", message);
							resolve(message);
						} else {
							resolve([]);
						}
					} else {
						reject(new Error('status_' + xmlhttp.status));
					}
				}
			};

			xmlhttp.open('POST', url, true);
			xmlhttp.setRequestHeader('Content-Type', 'application/json');
			xmlhttp.send(JSON.stringify(body));
		});
	},
	send: function (text, e) {
		var that = this;
		if (e) e.preventDefault();
		if (!text) {
			return;
		}
		var message = {
			type: 'outgoing',
			text: text
		};
		that.last_user_message = message;
		this.clearReplies();
		// console.log("this message will get rendered outgoing =>", message);
		that.renderMessage(message);

		that.deliverMessage({
			type: 'message',
			text: text,
			user: this.guid,
			channel: this.options.use_sockets ? 'websocket' : 'webhook'
		});

		this.input.value = '';
		// console.log("this message will get rendered 2 =>", message);

		this.trigger('sent', message);

		return false;
	},
	deliverMessage: function (message) {
		if (this.options.use_sockets) {
			this.socket.send(JSON.stringify(message));
		} else {
			this.webhook(message);
		}
	},
	getHistory: function (guid) {
		var that = this;
		if (that.guid) {
			that
				.request('/botkit/history', {
					user: that.guid
				})
				.then(function (history) {
					if (history.success) {
						that.trigger('history_loaded', history.history);
					} else {
						that.trigger('history_error', new Error(history.error));
					}
				})
				.catch(function (err) {
					that.trigger('history_error', err);
				});
		}
	},
	webhook: function (message) {
		var that = this;

		that
			.request('/api/messages', message)
			.then(function (messages) {
				messages.forEach((message) => {
					that.trigger(message.type, message);
				});
			})
			.catch(function (err) {
				that.trigger('webhook_error', err);
			});
	},
	connect: function (user) {
		var that = this;

		if (user && user.id) {
			Botkit.setCookie('botkit_guid', user.id, 1);

			user.timezone_offset = new Date().getTimezoneOffset();
			that.current_user = user;
			console.log('CONNECT WITH USER', user);
		}

		// connect to the chat server!
		if (that.options.use_sockets) {
			that.connectWebsocket(that.config.ws_url);
		} else {
			that.connectWebhook();
		}
	},
	connectWebhook: function () {
		var that = this;
		if (Botkit.getCookie('botkit_guid')) {
			that.guid = Botkit.getCookie('botkit_guid');
			connectEvent = 'welcome_back';
		} else {
			that.guid = that.generate_guid();
			Botkit.setCookie('botkit_guid', that.guid, 1);
		}

		if (this.options.enable_history) {
			that.getHistory();
		}

		// connect immediately
		that.trigger('connected', {});
		that.webhook({
			type: connectEvent,
			user: that.guid,
			channel: 'webhook'
		});
	},
	connectWebsocket: function (ws_url) {
		var that = this;
		// Create WebSocket connection.
		that.socket = new WebSocket(ws_url);

		var connectEvent = 'hello';
		if (Botkit.getCookie('botkit_guid')) {
			that.guid = Botkit.getCookie('botkit_guid');
			connectEvent = 'welcome_back';
		} else {
			that.guid = that.generate_guid();
			Botkit.setCookie('botkit_guid', that.guid, 1);
		}

		if (this.options.enable_history) {
			that.getHistory();
		}

		// Connection opened
		that.socket.addEventListener('open', function (event) {
			console.log('CONNECTED TO SOCKET');
			that.reconnect_count = 0;
			that.trigger('connected', event);
			that.deliverMessage({
				type: connectEvent,
				user: that.guid,
				channel: 'socket',
				user_profile: that.current_user ? that.current_user : null
			});
		});

		that.socket.addEventListener('error', function (event) {
			console.error('ERROR', event);
		});

		that.socket.addEventListener('close', function (event) {
			console.log('SOCKET CLOSED!');
			that.trigger('disconnected', event);
			if (that.reconnect_count < that.config.max_reconnect) {
				setTimeout(function () {
					console.log('RECONNECTING ATTEMPT ', ++that.reconnect_count);
					that.connectWebsocket(that.config.ws_url);
				}, that.config.reconnect_timeout);
			} else {
				that.message_window.className = 'offline';
			}
		});

		// Listen for messages
		that.socket.addEventListener('message', function (event) {
			var message = null;
			try {
				message = JSON.parse(event.data);
			} catch (err) {
				that.trigger('socket_error', err);
				return;
			}

			that.trigger(message.type, message);
		});
	},
	clearReplies: function () {
		this.replies.innerHTML = '';
	},
	quickReply: function (payload) {
		this.send(payload);
	},
	focus: function () {
		this.input.focus();
	},
	renderMessage: function (message) {
		var that = this;
		if (!that.next_line) {
			that.next_line = document.createElement('div');
			that.message_list.appendChild(that.next_line);
		}
		if (message.text) {
			if (message.text[0] === "{") {
				readmoreflag = 1;
				temp = JSON.parse(message.text);
				message.text = temp.text;
				that.bot_restanswer = JSON.parse(temp.restanswer);
				message.restanswer = that.bot_restanswer.slice(1);
				if(message.restanswer.length > 5) {
					message.restanswer = message.restanswer.slice(1,4)
				}
				let messagesource;
				let sourceslipt = temp.source.split(' ');
				if (sourceslipt.includes('40')) {
					messagesource = `AA40.htm`;
				}
				if (sourceslipt.includes('41')) {
					messagesource = `AA41.htm`;
				}
				if (sourceslipt.includes('COI')) {
					messagesource = `coi.htm`;
				}
				if (sourceslipt.includes('HOC') || sourceslipt.includes('hoc')) {
					messagesource = `hoc.htm`;
				}
				if (sourceslipt.includes('Appendix')) {
					messagesource = `AppendixAB.htm`;
				}
				if (sourceslipt.includes('INVESTIGATION')) {
					messagesource = `Investigationofoffence.htm`;
				}
				document.getElementById('preview_window').innerHTML = `<object type="text/html" data=${messagesource} style="
				width: 100%;
				height: 100%;
				
			"></object>`;

			}
			message.html = converter.makeHtml(message.text);
		}

		var innerHtml;
		switch (message.type) {
			case 'incoming':
				innerHtml = that.incoming_msg_template({
					message: message
				});

				// if (!message.isTyping) tts.speak(that.accessToken, message.text);
				if (!message.isTyping && !tts.muted) {
					tts.speak2(message.text);
				}
				break;
			case 'typing':
				innerHtml = that.incoming_msg_template({
					message: message
				});
				break;
			default:
				innerHtml = that.message_template({
					message: message
				});
		}
		that.next_line.innerHTML = innerHtml;
		if (!message.isTyping) {
			delete that.next_line;
		}
	},
	triggerScript: function (script, thread) {
		this.deliverMessage({
			type: 'trigger',
			user: this.guid,
			channel: 'socket',
			script: script,
			thread: thread
		});
	},
	identifyUser: function (user) {
		user.timezone_offset = new Date().getTimezoneOffset();

		this.guid = user.id;
		Botkit.setCookie('botkit_guid', user.id, 1);

		this.current_user = user;

		this.deliverMessage({
			type: 'identify',
			user: this.guid,
			channel: 'socket',
			user_profile: user
		});
	},
	receiveCommand: function (event) {
		switch (event.data.name) {
			case 'trigger':
				// tell Botkit to trigger a specific script/thread
				console.log('TRIGGER', event.data.script, event.data.thread);
				Botkit.triggerScript(event.data.script, event.data.thread);
				break;
			case 'identify':
				// link this account info to this user
				console.log('IDENTIFY', event.data.user);
				Botkit.identifyUser(event.data.user);
				break;
			case 'connect':
				// link this account info to this user
				Botkit.connect(event.data.user);
				break;
			default:
				console.log('UNKNOWN COMMAND', event.data);
		}
	},
	sendEvent: function (event) {
		if (this.parent_window) {
			this.parent_window.postMessage(event, '*');
		}
	},
	setCookie: function (cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
		var expires = 'expires=' + d.toUTCString();
		document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
	},
	getCookie: function (cname) {
		var name = cname + '=';
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return '';
	},
	generate_guid: function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	boot: function (user) {
		console.log('Booting up');

		// tts.getAccessToken('').then((token) => {
		//   this.accessToken = token;
		//   console.log(token);
		//   // tts.speak(token, 'hello, how are you my friend?');
		// });

		tts.configTTS();

		var that = this;

		that.message_window = document.getElementById('message_window');

		that.message_list = document.getElementById('message_list');

		that.message_template = hbsTemplates.user_message;
		that.incoming_msg_template = hbsTemplates.bot_message;

		that.replies = document.getElementById('message_replies');

		that.input = document.getElementById('messenger_input');

		that.focus();

		that.on('connected', function () {
			that.message_window.className = 'connected';
			that.input.disabled = false;
			that.sendEvent({
				name: 'connected'
			});
		});

		that.on('disconnected', function () {
			that.message_window.className = 'disconnected';
			that.input.disabled = true;
		});

		that.on('webhook_error', function (err) {
			alert('Error sending message!');
			console.error('Webhook Error', err);
		});

		that.on('typing', function () {
			that.clearReplies();
			that.renderMessage({
				isTyping: true,
				type: 'incoming'
			});
		});

		that.on('sent', function () {
			// do something after sending
		});

		that.on('message', function (message) {
			// console.log('RECEIVED MESSAGE', message);
			if (message.type === 'message') message.type = 'incoming';
			that.renderMessage(message);
		});

		that.on('message', function (message) {
			if (message.goto_link) {
				window.location = message.goto_link;
			}
		});

		that.on('message', function (message) {
			that.clearReplies();
			if (message.quick_replies) {
				var list = document.createElement('ul');

				var elements = [];
				for (var r = 0; r < message.quick_replies.length; r++) {
					(function (reply) {
						var li = document.createElement('li');
						var el = document.createElement('a');
						el.innerHTML = reply.title;
						el.href = '#';

						el.onclick = function () {
							that.quickReply(reply.payload);
						};

						li.appendChild(el);
						list.appendChild(li);
						elements.push(li);
					})(message.quick_replies[r]);
				}

				that.replies.appendChild(list);

				// uncomment this code if you want your quick replies to scroll horizontally instead of stacking
				// var width = 0;
				// // resize this element so it will scroll horizontally
				// for (var e = 0; e < elements.length; e++) {
				//     width = width + elements[e].offsetWidth + 18;
				// }
				// list.style.width = width + 'px';

				if (message.disable_input) {
					that.input.disabled = true;
				} else {
					that.input.disabled = false;
				}
			} else {
				that.input.disabled = false;
			}
		});

		that.on('history_loaded', function (history) {
			if (history) {
				for (var m = 0; m < history.length; m++) {
					that.renderMessage({
						text: history[m].text,
						type: history[m].type == 'message_received' ? 'outgoing' : 'incoming' // set appropriate CSS class
					});
				}
			}
		});

		if (window.self !== window.top) {
			// this is embedded in an iframe.
			// send a message to the master frame to tell it that the chat client is ready
			// do NOT automatically connect... rather wait for the connect command.
			that.parent_window = window.parent;
			window.addEventListener('message', that.receiveCommand, false);
			that.sendEvent({
				type: 'event',
				name: 'booted'
			});
			console.log('Messenger booted in embedded mode');
		} else {
			console.log('Messenger booted in stand-alone mode');
			// this is a stand-alone client. connect immediately.
			that.connect(user);
		}

		return that;
	}
};

(function () {
	// your page initialization code here
	// the DOM will be available here
	initialize();
})();

module.exports = { Botkit, Client };
