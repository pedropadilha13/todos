const electron = require('electron');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow, addWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadURL(`file://${__dirname}/main.html`);
  mainWindow.on('closed', () => app.quit());

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    height: 200,
    width: 300,
    title: 'Add New Todo',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  addWindow.loadURL(`file://${__dirname}/add.html`);
  addWindow.on('closed', () => (addWindow = null));
}

ipcMain.on('todo:add', (event, todo) => {
  mainWindow.webContents.send('todo:add', todo);
  addWindow.close();
});

const menuTemplate = [
  isMac
    ? {
        label: app.name
      }
    : null,
  {
    label: 'File',
    submenu: [
      {
        label: 'New Todo',
        accelerator: 'Command+N',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Todos',
        accelerator: 'Command+U',
        click() {
          mainWindow.webContents.send('todo:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: isMac ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
  isDev
    ? {
        label: 'View',
        submenu: [
          {
            role: 'reload'
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) {
              focusedWindow.toggleDevTools();
            }
          }
        ]
      }
    : null
];

if (isMac) {
  menuTemplate.unshift();
}

if (isDev) {
  menuTemplate.push();
}
