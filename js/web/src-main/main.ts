import {app, dialog, BrowserWindow} from 'electron';
import path from 'path';
import {spawn} from 'child_process';
import {platform} from 'os';
import contextMenu from 'electron-context-menu';

const isDev = process.env.NODE_ENV === 'development';
const accountListener = process.env.ACCOUNT_LISTENER || '/ip4/127.0.0.1/tcp/9092/grpcws';
const protocolListener = process.env.PROTOCOL_LISTENER || '/ip4/127.0.0.1/tcp/9091/grpcws';
const noDaemon = process.env.NO_DAEMON === 'true';

app.name = 'Berty'

contextMenu({
	showSaveImageAs: true
});

const createWindow = (): void => {
	const mainWindow = new BrowserWindow({
		height: 800,
		width: 420,
		webPreferences: {
			nodeIntegration: false,
			nodeIntegrationInWorker: true,
			nodeIntegrationInSubFrames: true,
			enableRemoteModule: true,
			contextIsolation: true,
			// preload: path.join(__dirname, 'preload.js'),
			spellcheck: true,
		}
	});

	if (isDev) {
			mainWindow.loadURL(`http://localhost:3002#${accountListener}`)
				.catch(err => console.log('An error occurred: ', err));

			mainWindow.webContents.openDevTools({ mode: 'detach' });

	} else {
		mainWindow.loadFile(path.join('build', 'index.html'), {hash: accountListener}).catch(err => console.log('An error occurred: ', err));
	}
};

app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

if (!noDaemon) {
	const startedAt = Date.now()

	let execPath = ''
	if (isDev) {
		switch (platform()) {
			case 'darwin':
				execPath = 'berty'
				break
			default:
				throw new Error('unsupported platform')
		}
	} else {
		switch (platform()) {
			case 'darwin':
				execPath = path.join(app.getPath('exe'), '../../bin/berty');
				break
			default:
				throw new Error('unsupported platform')
		}
	}

	const bertyDaemon = spawn(execPath, ['account-daemon', '-node.account.listeners', accountListener, '-node.listeners', protocolListener, '--log.filters=bty.grpc']);

	bertyDaemon.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
	});

	bertyDaemon.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});

	bertyDaemon.on('close', (code) => {
		console.log(`child process close all stdio with code ${code}`);
		app.quit()
	});

	bertyDaemon.on('exit', (code) => {
		if (code !== 0 && (Date.now() - startedAt) < 2000) {
			dialog.showErrorBox('Unable to start app', 'Another Berty daemon is probably running, check logs for more details')
		}

		console.log(`child process exited with code ${code}`);
		app.quit()
	});

	/* 'before-quit' is emitted when Electron receives
	 * the signal to exit and wants to start closing windows */
	app.on('before-quit', () => {
		bertyDaemon.kill()
	});
}
