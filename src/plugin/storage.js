const browser = {
    eSetStore (k, v, p=false) {
        p ? window.localStorage.setItem(k, JSON.stringify({ v })) : window.sessionStorage.setItem(k, JSON.stringify({ v }))
    },
    eGetStore (k) {
        try {
            return JSON.parse(window.sessionStorage.getItem(k) || window.localStorage.getItem(k)).v
        } catch (error) {
            return undefined
        }
    },
    eRemoveStore (k) {
        window.sessionStorage.removeItem(k)
        window.localStorage.removeItem(k)
    }
}

const electron = {
    eSetStore (k, v, p=false) {
        p ? window.localStore.set(k, v) : window.sessionStore.set(k, v)
    },
    eGetStore (k) {
        try {
            return window.sessionStore.get(k) || window.localStore.get(k)
        } catch (error) {
            return undefined
        }
    },
    eRemoveStore (k) {
        window.localStore.delete(k)
        window.sessionStore.delete(k)
    }
}

const methods = window.isBrowser ? browser : electron
const mixin = { methods }

export {
    methods,
    mixin
}
