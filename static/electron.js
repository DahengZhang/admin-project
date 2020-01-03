try {
    window.remote = require('electron').remote
    window.ipcRenderer = require('electron').ipcRenderer
    const os = require('os')
    const path = require('path')
    const Store = require('electron-store')
    const option = {
        fileExtension: '',
        clearInvalidConfig: true
    }
    window.sessionStore = new Store(Object.assign({}, option, {
        name: 'session',
        cwd: path.join(os.homedir(), `.${remote.getGlobal('projectName')}`)
    }))
    window.localStore = new Store(Object.assign({}, option, {
        name: 'local',
        cwd: path.join(os.homedir(), `.${remote.getGlobal('projectName')}`)
    }))
} catch (err) {
    window.isBrowser = true
    console.warn('not at electron environment!')
}
