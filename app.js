const os = require('os')
const fs = require('fs')
const path = require('path')
const http = require('http')
const axios = require('axios')
const AdmZip = require('adm-zip')
const moment = require('moment')
const Koa = require('koa')
const static = require('koa-static')
const { app, BrowserWindow, Menu, screen, ipcMain, dialog, shell } = require('electron')

const localTmpPath = path.join(os.tmpdir(), 'dist.zip') // 本地临时文件
const localDistPath = path.join(os.homedir(), 'AppData/Roaming/xzff') // 网站资源存放目录
const logFilePath = path.join(os.homedir(), 'AppData/Roaming/xzff/log.txt') // 日志文件目录

const isDev = process.env.NODE_ENV === 'development'
let { port } = require('./configs/server')

ipcMain.on('bridge', (e, a) => {
    switch (a.control) {
        case 'select-file': selectFile(e, a.option); break;
        case 'open-page': openPage(e, a.option); break;
        case 'close-page': closePage(e, a.option); break;
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

app.on('ready', async _ => {
    if (!isDev) {
        fs.mkdirSync(localDistPath, { recursive: true })
        try {
            const res = await toDownload('https://dldir1.qq.com/qqfile/qq/TIM2.3.2/21173/TIM2.3.2.21173.ee', localTmpPath)
            await unZipFile(res, localDistPath)
        } catch (error) {
            // 解压自带的包
            fs.copyFileSync(path.join(__dirname, 'package', 'dist.zip'), localTmpPath)
            await unZipFile(localTmpPath, localDistPath)
        }

        // 获取可用端口
        port = await checkPort(10000)
        // 启动服务器
        const serve = new Koa()
        serve.use(static(localDistPath))
        serve.listen(port, _ => console.log(`serve is running at ${port}...`))
    }

    // 隐藏菜单
    Menu.setApplicationMenu(null)

    const win = createWin({
        otherScreen: true,
        fullscreen: false,
        maxSize: true
    })

    win.webContents.openDevTools()
    win.loadURL(`http://localhost:${port}/login.html`)

})

// 获取可用端口
function checkPort (port) {
    const serve = http.createServer().listen(port)
    return new Promise((resolve, _) => {
        serve.on('listening', _ => {
            serve.close()
            resolve(port)
        })
        serve.on('error', async _ => {
            resolve(await checkPort(port + 1))
        })
    })
}

// 创建窗口
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

    let maxSize = false
    if (option.maxSize) {
        maxSize = option.maxSize
    }

    const win = new BrowserWindow(Object.assign({}, {
        fullscreen: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    }, option))

    maxSize && win.maximize()

    win.once('ready-to-show', _ => {
        win.show()
    })
    return win
}

// 选择文件
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

// 用新窗口打开页面
function openPage (_, option) {
    const url = option.url || ''
    const win = createWin(option)
    win.loadURL(url)
}

// 关闭窗口
function closePage (event) {
    event.close()
}

// 重新加载页面
function loadPage (event, option) {
    event.sender.loadURL(option.url)
}

// 打开文件
function openFile (_, { localPath }) {
    localPath && shell.openItem(localPath)
}

// 压缩文件
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

// 解压文件
function unZipFile (origin, target) {
    const unzip = new AdmZip(origin)
    return new Promise((resolve, reject) => {
        unzip.extractAllToAsync(target, true, e => {
            e ? reject() : resolve()
        })
    })
}

// 下载文件
async function downloadUrl (event, { url, filename='tmp.xls' }) {
    try {
        const savePath = dialog.showSaveDialogSync({ defaultPath: path.join(os.homedir(), 'Documents', filename) })
        if (savePath) {
            event.sender.send('download-url', await toDownload(url, savePath))
        }
    } catch (error) {
        event.sender.send('download-url', false)
    }
}

// 下载方法
function toDownload (url, savePath) {
    return new Promise((resolve, reject) => {
        axios({
            url,
            method: 'GET',
            responseType: 'stream'
        }).then(res => {
            res.data.pipe(fs.createWriteStream(savePath)).on('finish', _ => {
                resolve(savePath)
            }).on('error', _ => {
                reject('save fail')
            })
        }).catch(_ => {
            reject('download fail')
        })
    })
}

// 日志系统
function log (content) {
    isDev
        ? console.log(content)
        : fs.appendFileSync(logFilePath, `${moment().format('YYYY/MM/DD HH:mm:ss')} ${content}\n`)
}
