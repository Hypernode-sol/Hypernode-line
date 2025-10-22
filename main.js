import path from 'path';
import { glob } from 'glob';
import fs from 'fs';
import { app, BrowserWindow } from 'electron';
import autoUpdater from './auto-updater';

const debug = process.argv.includes('--debug');
if (process.mas) app.setName('hypernodeline');

let mainWindow = null;

function initialize() {
const shouldQuit = makeSingleInstance();
if (shouldQuit) return app.quit();
  function createWindow() {
    const windowOptions = {
        width: 1080,
        minWidth: 680,
        height: 880,
        title: app.getName(),
        icon: process.platform === 'linux' ? path.join(__dirname, '/assets/app-icon/png/512.png') : undefined,
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(`file://${path.join(__dirname, '/index.html')}`);

    if (debug) {
        mainWindow.webContents.openDevTools();
        mainWindow.maximize();
        try {
            require('devtron').install();
        } catch (error) {
            console.warn('Devtron installation failed:', error);
        }
    }

    mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', () => { createWindow(); autoUpdater.initialize(); console.log('Updater initialized'); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });
  }

function makeSingleInstance() {
return process.mas ? false : !app.requestSingleInstanceLock() && app.quit();
}

async function ensureCallbackPath() {
const callbackPath = path.join(app.getPath('userData'), 'callbacks');
try { await fs.promises.mkdir(callbackPath, { recursive: true }); } catch (error) { console.error('Error ensuring callback path:', error); }
}

ensureCallbackPath();

switch (process.argv[1]) {
case '--squirrel-install':
autoUpdater.createShortcut(() => app.quit());
break;
case '--squirrel-uninstall':
autoUpdater.removeShortcut(() => app.quit());
break;
case '--squirrel-obsolete':
case '--squirrel-updated':
app.quit();
break;
default:
initialize();
}
