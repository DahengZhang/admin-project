const os = require('os')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const AdmZip = require('adm-zip')
const { app, BrowserWindow, Menu, screen, ipcMain, dialog, shell } = require('electron')

ipcMain.on('bridge', (e, a) => {
    switch (a.control) {
        case 'select-file': selectFile(e, a.option); break;
        case 'open-page': openPage(e, a.option); break;
        case 'load-page': loadPage(e, a.option); break;
        case 'zip-file': zipFile(e, a.option); break;
        case 'open-file': openFile(e, a.option); break;
        case 'download-url': downloadUrl(e, a.option); break;
        default:
            const wins = BrowserWindow.getAllWindows()
            wins.forEach(item => {
                item.webContents.send('bridge', a)
            })
    }
})

app.on('ready', async () => {
    Menu.setApplicationMenu(null)

    const win = createWin({
        otherScreen: true,
        fullscreen: true
    })

    win.webContents.openDevTools()
    win.loadURL('http://localhost:3000')

})

function createWin (option = {}) {
    const externalDisplay = screen.getAllDisplays().find(item => {
        return item.bounds.x !== 0 || item.bounds.y !== 0
    })

    if (option.otherScreen) {
        // 是否在副屏上打开
        delete option.otherScreen
        !option.x && (option.x = 0)
        !option.y && (option.y = 0)
        option.x = option.x + externalDisplay.bounds.x
        option.y = option.y + externalDisplay.bounds.y
    }

    const win = new BrowserWindow(Object.assign({}, {
        fullscreen: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    }, option))
    win.once('ready-to-show', () => {
        win.show()
    })
    return win
}

function selectFile (event, option) {
    dialog.showOpenDialog(Object.assign({}, {
        // 默认
    }, option)).then(res => {
        const { canceled, filePaths } = res
        if (!canceled) {
            event.sender.send('select-file', filePaths)
        } else {
            event.sender.send('select-file', false)
        }
    }).catch(_ => {
        event.sender.send('select-file', false)
    })
}

function openPage (_, option) {
    const url = option.url || ''
    const win = createWin(option)
    win.loadURL(url)
}

function loadPage (event, option) {
    event.sender.loadURL(option.url)
}

function openFile (_, { localPath }) {
    localPath && shell.openItem(localPath)
}

function zipFile (event, { targetPath, origins, filename='dist.zip' }) {
    const zip = new AdmZip()
    origins.forEach(item => {
        fs.lstatSync(item).isDirectory() ? zip.addLocalFolder(item, path.basename(item)) : zip.addLocalFile(item)
    })
    zip.writeZip(path.join(targetPath, filename), e => {
        if (e) {
            event.sender.send('zip-file', false)
        } else {
            event.sender.send('zip-file', path.join(targetPath, filename))
        }
    })
}

function downloadUrl (event, { url, filename='tmp.xls' }) {
    try {
        const savePath = dialog.showSaveDialogSync({ defaultPath: path.join(os.homedir(), 'Documents', filename) })
        if (savePath) {
            axios({
                url,
                method: 'GET',
                responseType: 'stream'
            }).then(res => {
                res.data.pipe(fs.createWriteStream(savePath)).on('finish', _ => {
                    event.sender.send('download-url', savePath)
                }).on('error', _ => {
                    event.sender.send('download-url', false)
                })
            }).catch(_ => {
                event.sender.send('download-url', false)
            })
        } else {
            event.sender.send('download-url', false)
        }
    } catch (error) {
        event.sender.send('download-url', false)
    }
}
