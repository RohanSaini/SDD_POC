const path = require('path');

module.exports = function (controller) {
	// make public/index.html available as localhost/index.html
	// by making the /public folder a static/public asset
	controller.publicFolder('/', path.join(__dirname, '..', 'public'));

	controller.middleware.receive.use(async (bot, message, next) => {
		if (message.type === 'message' || message.type === 'hello')
			await bot.reply(message, { type: 'typing' });
		next();
	});

	controller.interrupts('exit', 'message', async (bot, message) => {
		await bot.cancelAllDialogs();
		await bot.reply(message, {
			text:
				`Hi I am your digital legal assistant. I can help you answer questions on:\n` +
				`1. Army Acts 40 & 41.\n` +
				`2. Court of Inquiry.\n` +
				`3. Hearing of Charge.\n` +
				`4. Incidents that have to be reported.`
		});
		await bot.beginDialog('enquiry');
	});

	console.log('Chat with me: http://localhost:' + (process.env.PORT || 3000));

	controller.on('hello', async (bot, message) => {
		await bot.changeContext(message.reference);
		// await bot.beginDialog('enquiry');
		setTimeout(async () => {
			await bot.reply(message, {
				text:
					`Hi I am your digital legal assistant. I can help you answer questions on:\n` +
					`1. Army Acts 40 & 41.\n` +
					`2. Court of Inquiry.\n` +
					`3. Hearing of Charge.\n` +
					`4. Incidents that have to be reported.\n`+
					`5. Investigation of offence`
			});
			await bot.beginDialog('enquiry');
		}, 1000);
	});

	controller.hears(
		[
			'hi',
			'hello',
			'hey',
			'help',
			'home',
			'helps',
			'cancel',
			'exit', 'main menu', 'main'
		],
		['message'],
		async (bot, message) => {
			setTimeout(async () => {
				await bot.reply(message, {
					text:
						`Hi I am your digital legal assistant. I can help you answer questions on:\n` +
						`1. Army Acts 40 & 41.\n` +
						`2. Court of Inquiry.\n` +
						`3. Hearing of Charge.\n` +
						`4. Incidents that have to be reported.\n`+
						`5. Investigation of offence`
				});
				await bot.beginDialog('enquiry');
			}, 1000);
		}
	);

	controller.on('message,direct_message', async (bot, message) => {
		await bot.reply(message, {
			text: 'Sorry I am still learning. I can help you with'
		});
	});
};