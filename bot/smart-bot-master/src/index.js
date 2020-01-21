const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const { initializeElasticSearch } = require('../elasticsearch');

const BotkitController = require('../botkit');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	// eslint-disable-line global-require
	app.quit();
}

// Processes' status codes - defaults to initializing
const processStatus = {
	initializing: 'initializing...',
	initialized: 'initialized!',
	error: 'initialization error!'
};

// Object containing the initialization status of various processes in the app
var processes = {
	electron: {
		name: 'Electron UI',
		status: processStatus.initializing,
		ok: true
	},
	botkit: {
		name: 'Botkit Server',
		status: processStatus.initializing,
		ok: true
	},
	elasticsearch: {
		name: 'ElasticSearch Engine',
		status: processStatus.initializing,
		ok: true
	},
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 750,
		webPreferences: {
			nodeIntegration: true
		},
		icon: __dirname + '/assets/images/indian-army.ico'
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	// Remove the menu bar.
	// mainWindow.removeMenu();

	mainWindow.on('beforeunload', (event) => {
		console.log('mainWindow beforeunload fired');
		event.returnValue = false;
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		console.log('window closed');
		mainWindow = null;
	});
};

const emitInitUpdateEvent = () => {
	mainWindow.webContents.executeJavaScript(
		`window.dispatchEvent(new CustomEvent('initUpdate', { 'detail': {` +
		`'processes': ${JSON.stringify(processes)}, 'processStatus': ${JSON.stringify(processStatus)} }}))`);
};

let esProcess;
const initializeServices = async () => {

	// Set intialization status of ELectron to processStatus.initialized and emit 'initUpdate' event
	processes.electron.status = processStatus.initialized;
	mainWindow.webContents.once('dom-ready', () => emitInitUpdateEvent());

	// Initialize ElasticSearch Instance and register event handler
	esProcess = await initializeElasticSearch();
	esProcess.on('exit', (code, signal) => {
		// Set intialization status of ElasticSearch to processStatus.initialized and emit 'initUpdate' event
		processes.elasticsearch.status = processStatus.initialized;
		emitInitUpdateEvent();

		// Use process exit code to debug
		if (code === 0) {
			processes.elasticsearch.status = processStatus.initialized;
		}
	});

	// Register 'ready' event handler to notify app of its initialization status
	BotkitController.ready(() => {
		// Set intialization status of BotKit to processStatus.initialized and emit 'initUpdate' event
		processes.botkit.status = processStatus.initialized;
		emitInitUpdateEvent();
	});
};

const registerShortcuts = () => {
	// globalShortcut.register('CommandOrControl+R', (event) => {

	// 	initializeServices();
	// });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	console.log('Electron app ready!');
	createWindow();
	initializeServices();
	registerShortcuts();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
	// esProcess.kill('SIGINT');
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
