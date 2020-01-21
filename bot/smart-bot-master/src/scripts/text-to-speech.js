// const { fs, request, xmlbuilder } = require('./nodeImports');

class TextToSpeech {
	constructor(muted = false) {
		this.muted = muted;
	}

	speaker_btn;

	async configTTS() {
		var that = this;
		// this.accessToken = await this.getAccessToken();
		var speaker_btn = document.getElementById('speaker_btn');
		speaker_btn.addEventListener('click', function (event) {
			if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
			that.muted = !that.muted;
			if (that.muted) speaker_btn.firstElementChild.textContent = 'volume_off';
			else speaker_btn.firstElementChild.textContent = 'volume_up';
		});
		that.speaker_btn = speaker_btn;
	}

	async getAccessToken(subscriptionKey) {
		subscriptionKey = 'f634c4266fea4996bf3e362e9436461a';
		let options = {
			method: 'POST',
			uri: 'https://centralindia.api.cognitive.microsoft.com/sts/v1.0/issueToken',
			headers: {
				'Content-Type': 'application/json',
				'Ocp-Apim-Subscription-Key': subscriptionKey
			}
		};
		return request(options).catch(err => {
			console.log('error getting speech token:', err);
			return '';
		});
	}

	async textToSpeech(accessToken, text) {
		let xml_body = xmlbuilder
			.create('speak')
			.att('version', '1.0')
			.att('xml:lang', 'en-us')
			.ele('voice')
			.att('xml:lang', 'en-us')
			.att('name', 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)')
			.txt(text)
			.end();

		let body = xml_body.toString();

		let options = {
			method: 'POST',
			baseUrl: 'https://centralindia.tts.speech.microsoft.com/',
			url: 'cognitiveservices/v1',
			headers: {
				Authorization: 'Bearer ' + accessToken,
				'cache-control': 'no-cache',
				'User-Agent': 'speechtestds',
				// 'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
				'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
				'Content-Type': 'application/ssml+xml'
			},
			body: body
		};

		let req = request(options).on('response', response => {
			console.log(response.statusCode);
			if (response.statusCode === 200) {
				req.pipe(fs.createWriteStream('./src/response.mp3'));
				// req.pipe(this.audioStream);
			}
		});
		return req;
	}

	async speak(accessToken, text) {
		let audioReq = await this.textToSpeech(accessToken, text);
		let fsFile = fs.readFileSync('./src/response.mp3');
		let audioFile = new Blob([fsFile], { type: 'audio/mp3' });
		let audioUrl = URL.createObjectURL(audioFile);
		let audio = new Audio(audioUrl).play();

		// fs.readFileSync('response.mp3')

		// let audioReq = await this.textToSpeech(accessToken, text);
		// let audio = new Audio('response.mp3');
		// audio.play();

		// let audioBlob = await this.textToSpeech(accessToken, text);
		// console.log(typeof audioBlob);
		// console.log(audioBlob);
		// let audioFile = new Blob([audioBlob], { type: 'audio/mp3' });
		// console.log(audioFile.type, audioFile.size);
		// let audioUrl = URL.createObjectURL(audioFile);
		// console.log(`%c ${audioUrl}`, 'color: yellow');
		// let audio = new Audio(audioUrl);
		// // audio.play();
		// window.open(audioUrl);
	}

	async speak2(text) {
		var that = this;
		if ('speechSynthesis' in window) {
			var speech = new SpeechSynthesisUtterance(text);
			speech.lang = 'en-US';
			window.speechSynthesis.speak(speech);
		}
	}
}

// let tts = new TextToSpeech();
// tts.getAccessToken('abc').then((token) => {
//   console.log(token);
//   tts.speak(token, 'hello, how are you my friend?');
// });

module.exports = TextToSpeech;