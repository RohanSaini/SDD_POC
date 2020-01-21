const { BotkitConversation } = require('botkit');
const incidentcheck = require('../esClient');

module.exports = function (controller) {
	let incident = new BotkitConversation('incident', controller);
	let memory = {};
	
	incident.ask({ text: 'Please enter your incident or type exit to end the conversation' }, [], { key: 'enquiryVal' });

	incident.say({
		text: async (template, vars) => {
			return await (function () {
				return new Promise(async (resolve, reject) => {
					memory['userquestion'] = vars.enquiryVal;
					let results = await incidentcheck.incident(vars.enquiryVal);
					console.log(results);
					if (parseFloat(results.res[0]) > 5) {
						resolve(
							`Mentioned incident is mandatory to report According to App A\n` +
							`\n---\n` + /* for horizontal rule */
							`**${results.res[1]}**\n` +
							`How reported:\n` +
							`a. First report within 24 hrs.\n` +
							`b. Detailed report within 72 hrs.\n` +
							`c. Weekly progress.\n`
						);
					} else {
						resolve(
							`According to App A mentioned incident is not mandatory ` +
							`to report thus it is either semi-formal or informal`
						);
					}
				});
			})();
		}
	});

	// incident.addQuestion('Do you want to check weather C of I is mandotary for this incident type "Yes", if you want to change the incident type "No"', [
	//     {
	//         pattern: 'yes',
	//         handler: async(response, convo, bot) => {
	//           let results = await incidentcheck.coicheck(memory['userquestion']);
	//           if(parseFloat(results[0]) >  5) {
	//                         await bot.say(`<div class="w3-container">
	//             <div class="w3-card-4" >
	//               <div class="w3-container">
	//                 <p> Court of inquiry is mandatory in this situation According to App b <br><b> ${results[1]}</b></p>

	//               </div>
	//             </div>
	//           </div>`)
	//           await bot.say(`<div class="w3-container">
	//           <div class="w3-card-4" >
	//             <div class="w3-container">
	//               <p> 'Further action will be taken as per the decision of Competent Authority'</p>

	//             </div>
	//           </div>
	//         </div>`)
	//           } else {
	//             await  bot.say(`<div class="w3-container">
	//             <div class="w3-card-4" >
	//               <div class="w3-container">
	//                 <p> Court of inquiry is not mandatory in this situation According to App B</p>

	//               </div>
	//             </div>
	//           </div>`)
	//           await  bot.say(`<div class="w3-container">
	//           <div class="w3-card-4" >
	//             <div class="w3-container">
	//               <p> 'Further action will be taken as per the decision of Competent Authority'</p>

	//             </div>
	//           </div>
	//         </div>`)

	//         await bot.cancelAllDialogs();
	//         await bot.beginDialog('incident');
	//           }
	//         }
	//     },
	//     {
	//       pattern: 'no',
	//       handler: async(response, convo, bot) => {
	//         await bot.cancelAllDialogs();
	//         await bot.beginDialog('reentercoi');
	//       }
	//   },
	//     {
	//         default: true,
	//         handler: async(response, convo, bot) => {
	//           await convo.gotoThread('defaultinput');
	//         }
	//     }
	// ],'nextstep','default');



	// incident.addMessage({
	//   text: 'Sorry I am still learning. Please try it in a different way.',
	// },'defaultinput');

	incident.after(async (results, bot) => {
		console.log('--------- incident End');
		memory = {};
		await bot.cancelAllDialogs();
		await bot.beginDialog('incident');
	});

	controller.addDialog(incident);
};
