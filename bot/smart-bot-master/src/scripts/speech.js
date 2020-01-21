const request = require('request-promise-native');
const SpeechSDK = require('microsoft-cognitiveservices-speech-sdk');
const mic = require('mic');
const fs = require('fs');

var CognitiveSpeech = {
  // speechRecognizer object containing all methods
  speechRecognizer: null,

  // current listening status
  listening: false,

  mic_btn: document.getElementById('mic_btn'),
  messenger_input: document.getElementById('messenger_input'),
  user_input_form: document.getElementById('user_input_form'),
  send_btn: document.getElementById('send_btn'),

  micInstance: null,
  micInputStream: null,
  speechSdkStream: SpeechSDK.AudioInputStream.createPushStream(),

  configMicInput: function() {
    this.micInstance = mic({
      rate: '16000',
      channels: '1',
      bitwidth: '16',
      encoding: 'unsigned-integer',
      fileType: 'wav',
      endian: 'big',
      debug: true,
      exitOnSilence: 6
    });

    this.micInputStream = this.micInstance.getAudioStream();

    // var outputFileStream = fs.WriteStream('output.wav');
    // this.micInputStream.pipe(outputFileStream);

    // this.speechSdkStream = SpeechSDK.AudioInputStream.createPushStream();

    var that = this;
    this.micInputStream.on('data', function(data) {
      // console.log('Recieved Input Stream: ' + data.length);
      that.speechSdkStream.write(data);
    });

    this.micInputStream.on('error', function(err) {
      cosole.log('Error in Input Stream: ' + err);
    });

    this.micInputStream.on('startComplete', function() {
      // console.log('Got SIGNAL startComplete');
      // setTimeout(function() {
      //   micInstance.pause();
      // }, 5000);
    });

    this.micInputStream.on('stopComplete', function() {
      // console.log('Got SIGNAL stopComplete');
    });

    this.micInputStream.on('pauseComplete', function() {
      console.log('Got SIGNAL pauseComplete');
      // setTimeout(function() {
      //   micInstance.resume();
      // }, 5000);
    });

    this.micInputStream.on('resumeComplete', function() {
      console.log('Got SIGNAL resumeComplete');
      // setTimeout(function() {
      //   micInstance.stop();
      // }, 5000);
    });

    this.micInputStream.on('silence', function() {
      console.log('Got SIGNAL silence');
      // that.micInstance.stop();
      // process.exit(0);
    });

    this.micInputStream.on('processExitComplete', function() {
      console.log('Got SIGNAL processExitComplete');
    });

    // this.micInstance.start();
  },

  // config speech method
  configSpeech: function() {
    this.mic_btn.addEventListener('click', (event) => {
      this.toggleVoiceRecognition();
    });
    return new Promise((resolve, reject) => {
      this.getSpeechToken()
        .then((token) => {
          console.log('speech token', token);
          let speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, 'centralindia');
          speechConfig.speechRecognitionLanguage = 'en-IN';
          // let audioConfig = SpeechSDK.AudioConfig.fromStreamInput(this.speechSdkStream);
          // let audioConfig = SpeechSDK.AudioConfig.fromMicrophoneInput('plughw:1, 0');
          let audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
          this.speechRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

          // register speech recognition event handlers
          this.speechRecognizer.recognized = (sender, event) => {
            // console.log('home.page: EVENT: recognized:', event);
            this.speechRecognizer.stopContinuousRecognitionAsync();
            let goodAnswer = event.result.text.slice(0, -1);
            console.log('Recognized phrase:', goodAnswer);
            this.stopRecognizer();
            if (goodAnswer) Botkit.send(goodAnswer);
          };
          this.speechRecognizer.canceled = (sender, event) => {
            console.log('home.page: EVENT: canceled:', event);
            this.stopRecognizer();
          };
          resolve();
        })
        .catch((err) => {
          console.log('chat.component: SpeechError', err);
        });
    });
  },

  // toggles the recognition
  toggleVoiceRecognition: function() {
    if (!this.speechRecognizer) {
      this.configSpeech();
    }
    if (this.listening) {
      this.stopRecognizer();
    } else {
      this.startRecognizer();
    }
  },

  startRecognizer: function() {
    this.listening = true;
    this.mic_btn.classList.add('active');
    // this.micInstance.start();
    this.speechRecognizer.startContinuousRecognitionAsync(
      () => {
        console.log('Listening...');
      },
      (error) => {
        console.log('Recognizer error:', error);
      }
    );
  },

  stopRecognizer: function() {
    this.mic_btn.classList.remove('active');
    this.listening = false;
    this.speechRecognizer.stopContinuousRecognitionAsync();
    // this.micInstance.stop();
  },

  getSpeechToken: function() {
    let subscriptionKey = 'f634c4266fea4996bf3e362e9436461a';
    let url = 'https://centralindia.api.cognitive.microsoft.com/sts/v1.0/issueToken';
    let headers = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    };
    return request
      .post(url, {
        headers
      })
      .then(
        (response) => {
          // console.log(response);
          return response;
        },
        (err) => {
          console.log(error);
          return err;
        }
      )
      .catch((err) => {
        console.log('getting speech token error:', err);
      });
	},
	
	speak() {
		SpeechSDK.Speech
	}
};

(function() {
  CognitiveSpeech.configSpeech();
})();

// CognitiveSpeech.configMicInput();
// CognitiveSpeech.configSpeech().then(() => {
//   CognitiveSpeech.toggleVoiceRecognition();
// });

// module.exports = CognitiveSpeech;
