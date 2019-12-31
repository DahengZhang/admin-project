const proxy = {
    local: 'http://127.0.0.1:3000'
}

module.exports = process.env.NODE_ENV === 'development' ? '' : proxy['local']
