const { BotkitConversation } = require('botkit');
const { PythonShell } = require('python-shell');
const incidentcheck = require('./linker/elastic');
module.exports = function(controller) {

let reentercoi = new BotkitConversation('reentercoi', controller);
let memory = {}
reentercoi.ask({ text: 'Please re-enter your incident or type exit to end the conversation' }, [], { key: 'enquiryVal' });

reentercoi.say({
  text: async (template, vars) => {
    return await (function() {
      return new Promise(async (resolve, reject) => {
        memory['userquestion'] = vars.enquiryVal;
        let results = await incidentcheck.coicheck(vars.enquiryVal);
        console.log(results);
        if(parseFloat(results[0]) >  5) {
          resolve(
            `<div class="w3-container">
            <div class="w3-card-4" >
              <div class="w3-container">
                <p> Court of inquiry is mandatory in this situation According to App b <br><b> ${results[1]}</b></p>
      
              </div>
            </div>
          </div>`
          )
        } else {
                      resolve(`<div class="w3-container">
                      <div class="w3-card-4" >
                        <div class="w3-container">
                          <p> Court of inquiry is not mandatory in this situation According to App b</p>
                
                        </div>
                      </div>
                    </div>`)
        }
      });
    })();
  }
});

reentercoi.say(`<div class="w3-container">
<div class="w3-card-4" >
  <div class="w3-container">
    <p> 'Further action will be taken as per the decision of Competent Authority'</p>

  </div>
</div>
</div>`)


reentercoi.after(async (results, bot) => {
    console.log('--------- re-enter incident End')
    memory = {};
    await bot.cancelAllDialogs();
    await bot.beginDialog('incident');
  });
controller.addDialog(reentercoi);


};
