import { filters } from '../../configs/electron'

export default window.isBrowser ? {
    methods: {
        eOpenPage (url) {
            window.open(url, '_blank')
        },
        eClosePage () {
            // 浏览器环境无解
            return Promise.reject('not at electron environment!')
        },
        eLoadPage (url) {
            window.open(url, '_self')
        },
        eSelectFolder () {
            // 可以用 input type=file 代替
            return Promise.reject('not at electron environment!')
        },
        eSelectFolders () {
            // 可以用 input type=file 代替
            return Promise.reject('not at electron environment!')
        },
        eSelectFile () {
            // 可以用 input type=file 代替
            return Promise.reject('not at electron environment!')
        },
        eSelectFiles () {
            // 可以用 input type=file 代替
            return Promise.reject('not at electron environment!')
        },
        eZipFile () {
            // 浏览器环境无解
            return Promise.reject('not at electron environment!')
        },
        eDownload (url) {
            // 可以用打开页面模拟
            return Promise.reject('not at electron environment!')
        },
        eOpenFile (url) {
            // 浏览器环境无解
            return Promise.reject('not at electron environment!')
        },
        eReadFolder (url) {
            // 浏览器环境无解
            return Promise.reject('not at electron environment!')
        }
    }
} : {
    methods: {
        eOpenPage (url) {
            window.ipcRenderer.send('bridge', { control: 'open-page', option: { url } })
        },
        eClosePage () {
            window.ipcRenderer.send('bridge', { control: 'close-page' })
        },
        eLoadPage (url) {
            console.log('重新加载页面')
            window.ipcRenderer.send('bridge', { control: 'load-page', option: { url } })
        },
        eSelectFolder (option={}) {
            // 选择单个文件加
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openDirectory'], ...filters(option) } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a[0])
                })
            })
        },
        eSelectFolders (option={}) {
            // 选择多个文件加
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openDirectory', 'multiSelections'], ...filters(option) } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a)
                })
            })
        },
        eSelectFile (option={}) {
            // 选择单个文件
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openFile'], ...filters(option) } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a[0])
                })
            })
        },
        eSelectFiles (option={}) {
            // 选择多个文件
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openFile', 'multiSelections'], ...filters(option) } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a)
                })
            })
        },
        eZipFile (origins, targetPath, filename) {
            // 压缩文件
            window.ipcRenderer.send('bridge', { control: 'zip-file', option: {
                origins, targetPath, filename
            } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('zip-file', (_, a) => {
                    !a ? reject('压缩失败') : resolve(a)
                })
            })
        },
        eDownload (url, filename) {
            // 下载文件
            ipcRenderer.send('bridge', { control: 'download-url', option: { url, filename } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('download-url', (_, a) => {
                    !a ? reject('下载失败') : resolve(a)
                })
            })
        },
        eOpenFile (localPath) {
            ipcRenderer.send('bridge', { control: 'open-file', option: { localPath } })
        },
        eReadFolder (folderPath) {
            ipcRenderer.send('bridge', { control: 'read-dir', option: { folderPath } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('read-dir', (_, a) => {
                    !a ? reject('读取文件夹失败') : resolve(a)
                })
            })
        }
    }
}
