import Vue from 'vue'
import App from './App'
import { mixin as storeMixin } from 'src/plugin/storage'
import { mixin as funcMixin } from 'src/plugin/electron'

Vue.mixin(storeMixin)
Vue.mixin(funcMixin)

new Vue({
    render: h => h(App)
}).$mount('#root')
