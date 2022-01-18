import { app, BrowserWindow } from 'electron';
import path from 'path';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const isDev = process.env.NODE_ENV === 'development';

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      enableRemoteModule: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    installExtension([REACT_DEVELOPER_TOOLS])
      .then(() => {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
      })
      .catch(err => console.log('An error occurred: ', err));
  } else {
    mainWindow.loadFile(path.join('build', 'index.html'));
  }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
