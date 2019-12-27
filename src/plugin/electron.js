export default window.isBrowser ? {
    methods: {
        eOpenPage (url) {
            window.open(url, '_blank')
        },
        eLoadPage (url) {
            window.open(url, '_self')
        },
        eSelectFile () {
            // 可以用 input type=file 代替
            return Promise.reject('not at electron environment!')
        },
        eZipFile () {
            // 浏览器环境无解
            return Promise.reject('not at electron environment!')
        }
    }
} : {
    methods: {
        eOpenPage (url) {
            window.ipcRenderer.send('bridge', { control: 'open-page', option: { url } })
        },
        eLoadPage (url) {
            window.ipcRenderer.send('bridge', { control: 'load-page', option: { url } })
        },
        eSelectFolder () {
            // 选择单个文件加
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openDirectory'] } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a[0])
                })
            })
        },
        eSelectFolders () {
            // 选择多个文件加
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openDirectory', 'multiSelections'] } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a)
                })
            })
        },
        eSelectFile () {
            // 选择单个文件
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openFile'] } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a[0])
                })
            })
        },
        eSelectFiles () {
            // 选择多个文件
            ipcRenderer.send('bridge', { control: 'select-file', option: { properties: ['openFile', 'multiSelections'] } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('select-file', (_, a) => {
                    !a ? reject('取消选择') : resolve(a)
                })
            })
        },
        eZipFile (targetPath, origins, filename) {
            window.ipcRenderer.send('bridge', { control: 'zip-file', option: {
                targetPath, origins, filename
            } })
            return new Promise((resolve, reject) => {
                ipcRenderer.on('zip-file', (_, a) => {
                    !a ? reject('压缩失败') : resolve(a)
                })
            })
        }
    }
}
