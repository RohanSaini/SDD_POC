const { BotkitConversation } = require('botkit');
const fs = require('fs');
const elasticdata = require('../esClient');

module.exports = function (controller) {
	let enquiry = new BotkitConversation('enquiry', controller);

	enquiry.ask({ text: 'Please enter your query' }, [], { key: 'enquiryVal' });
	let interptlist = ['exit','home','cancel']
	enquiry.say({
		text: async (template, vars) => {
			return await (function () {
				return new Promise(async (resolve, reject) => {
					let queryres = await elasticdata.common(vars.enquiryVal);
					let ress = queryres[0]['_source'];
					let ressscore = queryres[0]['_score'];
					// fs.appendFile('usersession.json', `{
					//   'userquestion':'${String(vars.enquiryVal)}',
					//   'botanswer':'${String(ress.doc)}'
					// }`+',', function (err) {
					//   if (err) throw err;
					//   console.log('Saved!');
					// });

					try {
						fs.writeFile(
							'usersession.txt',
							`{'question':${vars.enquiryVal},'answer':${ress.doc}},\n`,
							{ 'flag': 'a' },
							function (err) {
								if (err) {
									return console.error(err);
								}
							}
						);
						if(interptlist.includes(vars.enquiryVal)) {
							resolve("existing the conversation");
						} else {
							let taglink = ress.tag.split(' ');
						let sourcelink;
						console.log('---tag====> ', ressscore);

						if (taglink.includes('40')) {
							sourcelink = `[**${ress.tag}**](AA40.htm)`;
						}
						if (taglink.includes('41')) {
							sourcelink = `[**${ress.tag}**](AA41.htm)`;
						}
						if (taglink.includes('COI')) {
							sourcelink = `[**${ress.tag}**](coi.htm)`;
						}
						if (taglink.includes('HOC') || taglink.includes('hoc')) {
							sourcelink = `[**${ress.tag}**](hoc.htm)`;
						}
						if (taglink.includes('Appendix')) {
							sourcelink = `[**${ress.tag}**](AppendixAB.htm)`;
						}
						if (ress.doc === undefined || parseFloat(ressscore) < 7) {
							resolve('Sorry I am still learning. Can you please try it in a different way...');
						} 
						else {
							if (vars.enquiryVal.toLowerCase() === 'what is a court of inquiry'
								|| vars.enquiryVal.toLowerCase() === 'what is a court of inquiry?'
								|| vars.enquiryVal.toLowerCase() === 'what is court of inquiry?'
								|| vars.enquiryVal.toLowerCase() === 'what is court of inquiry'
							) {
								let ans = [
									'A Court of Inquiry (C of I) is an assembly of Officers or of JCOs or of Offrs and',
									'JCOs, WOs, and NCOs, directed to collect and record evidence, and if so required to report',
									'(by opinion, recommendations and declaration etc)',
									'with regard to any matter which may be referred to them'
								].join(' ');

								// resolve(
								// 	`${ans}\n` +
								// 	`\n---\n` + /* for horizontal rule */
								// 	`Source: COI 1`
								// );
								resolve(JSON.stringify({
									"text":`${ans}\n` +
									`\n---\n` + /* for horizontal rule */
									`Source: <mark>COI 1</mark>`,
									"source": ress.tag,
									"restanswer":JSON.stringify(queryres)
								}))
							} else {
								// resolve(
								// 	`${ress.doc}\n` +
								// 	`\n**Source:** ${sourcelink}`
								// );
								resolve(JSON.stringify({
									"text":`${ress.doc}\n` + `\nSource: <mark> ${ress.tag}</mark>`,
									"source": ress.tag,
									"restanswer":JSON.stringify(queryres)
								}))
							}
						}
						}
						
					} catch (err) {
						resolve('Sorry I am still learning. Can you please try it in a different way...');
					}
					// resolve('Offences under this clause should not be dealt with summarily under [**AA.s.80 **](AA41.htm/#note2),83 or 84.')
				});
			})();
		}
		
	});

	enquiry.after(async (results, bot) => {
		console.log('------- END');
		
		if(interptlist.includes(results.enquiryVal)) {
			await bot.say(
					`Hi I am your digital legal assistant. I can help you answer questions on:\n` +
					`1. Army Acts 40 & 41.\n` +
					`2. Court of Inquiry.\n` +
					`3. Hearing of Charge.\n` +
					`4. Incidents that have to be reported.`
			);
			await bot.beginDialog('enquiry');
		} else {
			await bot.beginDialog('enquiry');
		}
	});

	controller.addDialog(enquiry);
};
