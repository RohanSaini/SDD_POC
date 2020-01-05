const { BotkitConversation } = require('botkit');
const { PythonShell } = require('python-shell');
const fs = require('fs');
const elasticdata = require('./linker/elastic')

module.exports = function(controller) {
  let enquiryaa = new BotkitConversation('enquiry', controller);
  enquiryaa.ask({ text: 'Please enter your query or type exit to end the conversation' }, [], { key: 'enquiryVal' });

  enquiryaa.say({
    text: async (template, vars) => {
      let options = {
        mode: 'text',
        scriptPath: '../../Code/',
        args: [vars.enquiryVal]
      };
      return await (function() {
        return new Promise(async (resolve, reject) => {
          let queryres = await elasticdata.actquery(vars.enquiryVal)
          let ress = queryres;
          resolve(`<div class="w3-container">

          
            <div class="w3-card-4" style="width:100%;padding: 30px">

          
              <div class="w3-container">
                <p>${ress.doc === undefined ? 'No match found' : ress.doc}</p>
              </div>
            <footer style="color:black;background:none;text-align:right">
             Source : ${ress.tag === undefined? '-':ress.tag}
            </footer>
            </div>
          </div>`|| 'Not Found');
        });
      })();
    }
  });



  enquiryaa.after(async (results, bot) => {
    console.log('------- END')
    await bot.beginDialog('enquiry');
  });



  controller.addDialog(enquiryaa);

  let hocenquiry = new BotkitConversation('hoce', controller);
  hocenquiry.ask({ text: 'Please enter your query or type exit to end the conversation' }, [], { key: 'enquiryVal' });

  hocenquiry.say({
    text: async (template, vars) => {
      let options = {
        mode: 'text',
        scriptPath: '../../Code/',
        args: [vars.enquiryVal]
      };
      return await (function() {
        return new Promise(async (resolve, reject) => {
          let queryres = await elasticdata.hocquery(vars.enquiryVal)
          let ress = queryres;
          resolve(`<div class="w3-container">

          
            <div class="w3-card-4" style="width:100%;padding: 30px">

          
              <div class="w3-container">
                <p>${ress.doc === undefined ? 'No match found' : ress.doc}</p>
              </div>
            <footer style="color:black;background:none;text-align:right">
             Source : ${ress.tag === undefined? '-':ress.tag}
            </footer>
            </div>
          </div>`|| 'Not Found');
        });
      })();
    }
  });
  hocenquiry.after(async (results, bot) => {
    console.log('------- END')
    await bot.beginDialog('hoce');
  });
  controller.addDialog(hocenquiry);

  let coienquiry = new BotkitConversation('coie', controller);
  coienquiry.ask({ text: 'Please enter your query or type exit to end the conversation' }, [], { key: 'enquiryVal' });

  coienquiry.say({
    text: async (template, vars) => {
      let options = {
        mode: 'text',
        scriptPath: '../../Code/',
        args: [vars.enquiryVal]
      };
      return await (function() {
        return new Promise(async (resolve, reject) => {
          let queryres = await elasticdata.coiquery(vars.enquiryVal)
          let ress = queryres;
          if (vars.enquiryVal.toLowerCase() === "what is a court of inquiry" || vars.enquiryVal.toLowerCase() === "what is a court of inquiry?" || vars.enquiryVal.toLowerCase() === "what is court of inquiry?"
          || vars.enquiryVal.toLowerCase() === "what is court of inquiry"
          ) {
            resolve(`<div class="w3-container">

          
            <div class="w3-card-4" style="width:100%;padding: 30px">

          
              <div class="w3-container">
                <p>A Court of Inquiry (C of I) is an assembly of Officers or of JCOs or of Offrs and JCOs, WOs, and NCOs, directed to collect and record evidence, and if so required to  report (by opinion, recommendations and declaration etc)  with regard to any matter which may be referred to them}</p>
              </div>
            <footer style="color:black;background:none;text-align:right">
             Source : COI 1
            </footer>
            </div>
          </div>`|| 'Not Found');
          } else {
            resolve(`<div class="w3-container">

          
            <div class="w3-card-4" style="width:100%;padding: 30px">

          
              <div class="w3-container">
                <p>${ress.doc === undefined ? 'No match found' : ress.doc}</p>
              </div>
            <footer style="color:black;background:none;text-align:right">
             Source : ${ress.tag === undefined? '-':ress.tag}
            </footer>
            </div>
          </div>`|| 'Not Found');
          }

        });
      })();
    }
  });
  coienquiry.after(async (results, bot) => {
    console.log('------- END')
    await bot.beginDialog('coie');
  });
  controller.addDialog(coienquiry);

  

};
