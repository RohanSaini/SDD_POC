const { BotkitConversation } = require('botkit');
const incidentcheck = require('../esClient');

module.exports = function (controller) {
	var reentercoi = new BotkitConversation('reentercoi', controller);
	var memory = {};

	reentercoi.ask({ text: 'Please re-enter your incident or type exit to end the conversation' }, [], { key: 'enquiryVal' });

	reentercoi.say({
		text: async (template, vars) => {
			return await (function () {
				return new Promise(async (resolve, reject) => {
					memory['userquestion'] = vars.enquiryVal;
					var results = await incidentcheck.coicheck(vars.enquiryVal);
					console.log(results);
					if (parseFloat(results[0]) > 5) {
						resolve(`Court of inquiry is mandatory in this situation According to App b <br><b> ${results[1]}`);
					} else {
						resolve(`Court of inquiry is not mandatory in this situation According to App b`);
					}
				});
			})();
		}
	});

	reentercoi.say(`Further action will be taken as per the decision of Competent Authority`);

	reentercoi.after(async (results, bot) => {
		console.log('--------- re-enter incident End');
		memory = {};
		await bot.cancelAllDialogs();
		await bot.beginDialog('incident');
	});

	controller.addDialog(reentercoi);
};
