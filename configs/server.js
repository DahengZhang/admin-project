const getServerIp = () => {
    return window.remote.getGlobal('ip')
}

module.exports = {
    ip: '0.0.0.3',
    port: 7000,
    getServerIp
}
