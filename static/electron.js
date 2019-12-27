try {
    window.ipcRenderer = require('electron').ipcRenderer
} catch (err) {
    window.isBrowser = true
    console.warn('not at electron environment!')
}
