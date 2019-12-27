import Vue from 'vue'
import App from './App.vue'
import electron from './plugin/electron'

Vue.mixin(electron)

new Vue({
    render: h => h(App)
}).$mount('#root')
