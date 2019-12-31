import Vue from 'vue'
import App from './App'
import { mixin } from 'src/plugin/electron'

Vue.mixin(mixin)

new Vue({
    render: h => h(App)
}).$mount('#root')
