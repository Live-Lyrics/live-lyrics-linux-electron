const path = require('path');

const { Menu, app, BrowserWindow, screen } = require('electron');
const Positioner = require('electron-positioner');

function createWindow() {
  Menu.setApplicationMenu(false);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const browserWindow = new BrowserWindow({
    width: width / 2,
    height: height - 50,
    icon: path.join(__dirname, 'icons', 'favicon-32x32.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const positioner = new Positioner(browserWindow);
  positioner.move('topRight');
  browserWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
