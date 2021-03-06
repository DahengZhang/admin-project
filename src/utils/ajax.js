import qs from 'qs'
import axios from 'axios'
import { getServerIp } from 'root/configs/server'
import { methods as utils } from 'src/plugin/electron'

const _instance = axios.create({
    // withCredentials: true, // 默认值为 false，值为 true 时，跨域请求强制带 cookie
    baseURL: window.isBrowser ? '/' : getServerIp(), // 如果是浏览器就请求根路径
})

_instance.interceptors.request.use(config => {
    // config.headers['Content-Type'] = 'text/plain'
    const token = window.sessionStorage.getItem('token') || ''
    if (config.url.indexOf('sys/login') === -1 && config.url.indexOf('/nologin') === -1 && !token) {
        // 非登录页面检查本地是否有登录态
        utils.eClosePage()
        utils.eLoadPage('login')
        return
    } else {
        try {
            // 目前只用到 post 与 get 方法
            if (config.method.toLocaleLowerCase() === 'post') {
                // post 方法处理
                let data = qs.stringify(config.data)
                data = data ? data.split('&') : []
                data.push(`token=${token}`)
                data = data.join('&')
                config.data = data
            } else {
                // get 方法处理
                !config.params && (config.params = {})
                config.params.token = token
            }
        } catch (err) {
            console.error(err)
        }
        return config
    }
}, error => {
    console.error('request错误请求', error)
    return Promise.reject(error)
})

_instance.interceptors.response.use(({ data }) => {
    return data
}, error => {
    console.error('response错误请求', error)
    return Promise.reject(error)
})

export default _instance
