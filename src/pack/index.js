import Vue from 'vue'
import App from './App.vue'
import { methods } from 'src/plugin/electron'

Vue.mixin(methods)

new Vue({
    render: h => h(App)
}).$mount('#root')
