const formatNumber = (number) => {
    return number.toString().length > 1 ? number : Number(number) === 0 ? 0 : `0${number}`
}
const formatWeek = (day) => {
    switch (day) {
        case 1: return '一';
        case 2: return '二';
        case 3: return '三';
        case 4: return '四';
        case 5: return '五';
        case 6: return '六';
        case 7: return '日';
        default: return 'unkown'
    }
}

const dataURLtoFile = (dataurl, filename = 'tmp.png') => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}

const formatApiUrl = (url, args) => {
    for (let i in args) {
        url = url.replace(new RegExp(`{${i}}`, 'g'), args[i])
    }
    return url
}

const getObjectStorage = (key) => {
    let tmp = {}
    try {
        tmp = JSON.parse(window.sessionStorage.getItem(key))
    } catch (err) {
        console.error(err)
    }
    return tmp
}

const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

const getUrlParam = (key, url) => {
    url = url || location.href
    var reg = new RegExp('[?&]' + key + '=([^&]+)', 'gmi')
    if (reg.test(url)) return RegExp.$1
    return ''
}

const deepCopy = (data) => {
    let dataTmp = undefined

    if (data === null || !(typeof data === 'object')) {
        dataTmp = data
    } else {
        dataTmp = data.constructor.name === 'Array' ? [] : {}

        for (let key in data) {
            dataTmp[key] = deepCopy(data[key])
        }
    }

    return dataTmp
}

const checkType = (obj) => {
    let type = typeof obj;
    if (type != "object") {
        return type;
    }
    return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}

export {
    formatNumber,
    formatWeek,
    formatApiUrl,
    getObjectStorage,
    dataURLtoFile,
    getUrlParam,
    createUUID,
    deepCopy,
    checkType
}
