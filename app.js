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

const localTmpPath = path.join(os.tmpdir(), `${createUUID()}.zip`) // 本地临时文件
const localDistPath = path.join(os.homedir(), '.xzff') // 网站资源存放目录
const logFilePath = path.join(os.homedir(), '.xzff', 'log.txt') // 日志文件目录

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
        case 'read-dir': readDir(e, a.option); break;
        default:
            BrowserWindow.getAllWindows().forEach(item => {
                if (!a.includeMe && e.sender.sgin === item.webContents.sgin) {
                    // 此消息不需要发送到自身
                    return
                }
                item.webContents.send('bridge', a)
            })
    }
})

app.on('ready', async _ => {
    Menu.setApplicationMenu(Menu.buildFromTemplate([{
        label: '创建打包文件',
        click () {
            openPage(null, { url: 'pack' })
        }
    }]))
    if (!isDev) { // 如果是开发环境，跳过加压服务过程，直接使用本地启动的开发服务器
        fs.mkdirSync(localDistPath, { recursive: true })
        log('创建本地文件夹')
        log('当前开发环境'+isDev)
        /**
         * 没有版本管理服务器
         */
        // try {
        //     const res = await toDownload('https://dldir1.qq.com/qqfile/qq/TIM2.3.2/21173/TIM2.3.2.21173.ee', localTmpPath)
        //     await unZipFile(res, localDistPath)
        // } catch (error) {
        //     // 解压自带的包
        //     fs.copyFileSync(path.join(__dirname, 'package', 'dist.zip'), localTmpPath)
        //     await unZipFile(localTmpPath, localDistPath)
        // }

        // 直接使用使用本地资源
        try {
            log('开始解压本地资源')
            fs.copyFileSync(path.join(__dirname, 'package', 'dist.zip'), localTmpPath)
            await unZipFile(localTmpPath, localDistPath)
            log('本地资源解压完成')
        } catch (error) {
            log(`本地资源解压失败${error}`)
            app.quit()
        }

        // 获取可用端口
        port = await checkPort(port)

        // 启动服务器
        const serve = new Koa()
        serve.use(static(localDistPath))
        serve.use(async ctx => {
            const filename = ctx.request.url.match(/\/(\S*)(\/|.)?/) && ctx.request.url.match(/\/(\S*)(\/|.)?/)[1] || 'login'
            ctx.type = 'text/html;charset=utf-8'
            try {
                ctx.body = fs.readFileSync(path.join(localDistPath, `${filename}.html`))
            } catch (error) {
                ctx.body = 'fail no file!'
            }
        })
        log(`正在启动服务器在${port}端口`)
        serve.listen(port, e => e ? log(e) : log(`serve is running at ${port}...`))

        // 隐藏菜单
        Menu.setApplicationMenu(null)
    }

    log('创建基础窗口')
    const win = createWin({
        otherScreen: isDev,
        fullscreen: false,
        maxSize: true,
        alwaysTop: false
    })

    isDev && win.webContents.openDevTools()
    win.loadURL(`http://127.0.0.1:${port}/login.html`)

    win.on('closed', _ => {
        app.quit()
    })

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
    }) || {
        bounds: {
            x: 0,
            y: 0
        }
    }

    if (option.otherScreen) {
        // 是否在副屏上打开
        delete option.otherScreen
        !option.x && (option.x = 0)
        !option.y && (option.y = 0)
        option.x = option.x + externalDisplay.bounds.x
        option.y = option.y + externalDisplay.bounds.y
    }

    const sgin = option.sgin || createUUID()
    delete option.sgin

    const maxSize = option.maxSize || false
    delete option.maxSize

    const devTool = option.devTool || false
    delete option.devTool

    const alwaysTop = option.alwaysTop || false
    delete option.alwaysTop

    const win = new BrowserWindow(Object.assign({}, {
        fullscreen: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    }, option))

    win.webContents.sgin = sgin

    maxSize && win.maximize()
    devTool && win.webContents.openDevTools()
    alwaysTop && win.setAlwaysOnTop(true)

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
function openPage (_, option = {}) {
    const url = option.url || ''
    delete option.url
    log(`准备打开页面${url}`)
    const win = createWin(option)
    win.loadURL(/http/.test(url) ? url : `http://127.0.0.1:${port}${!/^\//.test(url) && '/' || ''}${url}`)
}

// 关闭窗口
function closePage (event, option='') {
    log('关闭窗口'+option)
    let target = BrowserWindow.getAllWindows().find(item => item.webContents.sgin === option) || null
    if (target && !option) {
        target = event.sender
    }
    target && target.destroy()
}

// 重新加载页面
function loadPage (event, option={}) {
    log(`准备加载页面${option.url}`)
    event.sender.loadURL(/http/.test(option.url) ? option.url : `http://127.0.0.1:${port}${!/^\//.test(option.url) && '/' || ''}${option.url}`)
}

// 打开文件
function openFile (_, { localPath }) {
    log(`准备打开文件${localPath}`)
    localPath && shell.openItem(localPath)
}

// 读取文件夹列表
function readDir (event, { folderPath=path.join(__dirname, 'dist') }) {
    const res = fs.readdirSync(folderPath)
    if (res) {
        event.sender.send('read-dir', res.map(item => path.join(__dirname, 'dist', item)))
    } else {
        event.sender.send('read-dir', false)
    }
}

// 压缩文件
function zipFile (event, { origins, targetPath=path.join(__dirname, 'package'), filename='dist.zip' }) {
    const zip = new AdmZip()
    origins.forEach(item => {
        fs.lstatSync(item).isDirectory() ? zip.addLocalFolder(item, path.basename(item)) : zip.addLocalFile(item)
    })
    fs.mkdirSync(targetPath, { recursive: true })
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

// 生成uuid
function createUUID () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
