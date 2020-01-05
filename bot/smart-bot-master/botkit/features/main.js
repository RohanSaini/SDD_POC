const { BotkitConversation } = require('botkit');
const { PythonShell } = require('python-shell');

module.exports = function(controller) {



    controller.on('hello', async (bot, message) => {
        await bot.changeContext(message.reference);
        // await bot.beginDialog('enquiry');
        setTimeout(async () => {
          await bot.reply(message, {
            text: 'Hi, I am your Legal digital assistant! How may I help you?',
            quick_replies: [

              {
                title: 'Report an Incident',
                payload: 'Report an Incident'
              },
              {
                title: 'Army Act 40 and 41',
                payload: 'Army Act 40 and 41'
              },
              {
                title: 'Court Of Inquiry',
                payload: 'Court Of Inquiry'
              },
              {
                title: 'Hearing Of Charges',
                payload: 'Hearing Of Charges'
              }
            ]
          });
        }, 1000);
      });


    controller.hears(
        [
          'hi',
          'hello',
          'howdy',
          'hey',
          'aloha',
          'hola',
          'bonjour',
          'oi',
          'help',
          'home',
          'helps',
          'cancel'
        ],
        ['message'],
        async (bot, message) => {
      
            await bot.reply(message, {
              text: 'Hi, I am your Legal digital assistant! How may I help you?',
              quick_replies: [
                {
                  title: 'Report an Incident',
                  payload: 'Report an Incident'
                },
                {
                  title: 'Army Act 40 and 41',
                  payload: 'Army Act 40 and 41'
                },
                {
                  title: 'Court Of Inquiry',
                  payload: 'Court Of Inquiry'
                },
                {
                  title: 'Hearing Of Charges',
                  payload: 'Hearing Of Charges'
                }
              ]
            });
    
        }
      );
    
    
      controller.on('message,direct_message', async (bot, message) => {
          await bot.reply(message, {
            text: 'Sorry I am still learning. I can help you with',
            quick_replies: [
              {
                title: 'Report an Incident',
                payload: 'Report an Incident'
              },
              {
                title: 'Army Act 40 and 41',
                payload: 'Army Act 40 and 41'
              },
              {
                title: 'Court Of Inquiry',
                payload: 'Court Of Inquiry'
              },
              {
                title: 'Hearing Of Charges',
                payload: 'Hearing Of Charges'
              }
            ]
          });
    });


    controller.hears(['incident','Report an Incident'], ['message'], async (bot, message) => {
        setTimeout(async () => {
            await bot.changeContext(message.reference);
            await bot.beginDialog('incident');
          }, 1000);
      });


      // controller.hears(['enquiry'], ['message'], async (bot, message) => {    
      //     await bot.reply(message, {
      //       text: 'From which document you want to make the enquiry?',
      //       quick_replies: [
      //         {
      //           title: 'Army Act 40 and 41',
      //           payload: 'Army Act 40 and 41'
      //         },
      //         {
      //           title: 'Court Of Inquiry',
      //           payload: 'Court Of Inquiry'
      //         },
      //         {
      //           title: 'Hearing Of Charges',
      //           payload: 'Hearing Of Charges'
      //         }
      //       ]
      //     });

      // });


    controller.hears(['Army Act 40 and 41'],['message'], async (bot,message)=>{
        await bot.changeContext(message.reference);
        await bot.beginDialog('enquiry');
    })

    controller.hears(['Court Of Inquiry'],['message'], async (bot,message)=>{
        await bot.changeContext(message.reference);
        await bot.beginDialog('coie');
    })

    controller.hears(['Hearing Of Charges'],['message'], async (bot,message)=>{
        await bot.changeContext(message.reference);
        await bot.beginDialog('hoce');
    })


      controller.interrupts('exit','message', async(bot, message) => {
        await bot.cancelAllDialogs();
        await bot.reply(message, {
            text: 'How may I help you further?',
            quick_replies: [
              {
                title: 'Report an Incident',
                payload: 'Report an Incident'
              },
              {
                title: 'Army Act 40 and 41',
                payload: 'Army Act 40 and 41'
              },
              {
                title: 'Court Of Inquiry',
                payload: 'Court Of Inquiry'
              },
              {
                title: 'Hearing Of Charges',
                payload: 'Hearing Of Charges'
              }
            ]
          });
       
       });

    

}