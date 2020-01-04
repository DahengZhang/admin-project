const proxy = {
    devServer: 'http://127.0.0.1:8080',
    proServer: 'http://127.0.0.1:8080'
}

const ip = process.env.NODE_ENV === 'development' ? proxy['devServer'] : proxy['proServer']

const getServerIp = () => {
    try {
        return window.remote.getGlobal('ip')
    } catch (_) {
        return ip
    }
}

module.exports = {
    ip,
    port: 7000,
    getServerIp
}
