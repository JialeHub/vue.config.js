import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './router/permission' // permission control
import store from './store'
import vuetify from './plugins/vuetify';
import myPlugin from './plugins/myPlugin';
import '@/plugins/element-ui';
import "@/styles/reset.scss"
import "@/styles/index.scss"
import "@/styles/common.scss"

Vue.config.productionTip = false
Vue.use(myPlugin)


new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
