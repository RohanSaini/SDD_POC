const path = require('path');

module.exports = function(controller) {
  // make public/index.html available as localhost/index.html
  // by making the /public folder a static/public asset
  controller.publicFolder('/', path.join(__dirname, '..', 'public'));

 

  controller.middleware.receive.use(async (bot, message, next) => {
    if (message.type === 'message' || message.type === 'hello')
      await bot.reply(message, { type: 'typing' });
    next();
  });



  console.log('Chat with me: http://localhost:' + (process.env.PORT || 3000));
};
