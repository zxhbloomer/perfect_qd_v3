import '@babel/polyfill'

import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

// add by zxh
import common_columns from './common/columns/columns'
import commonFunction from './common/commonFunction'
import constants_para from './common/constants/constants_para'
import constants_type from './common/constants/constants_dict'
import constants_program from './common/constants/constants_program'
import constants_emits from './common/constants/constants_emits'
import EventProxy from 'vue-event-proxy'
import global from './common/global/global'
import ElInputTag from '@/components/inputtag'
Vue.use(ElInputTag)
// 引入组件和样式
import RouterTab from '@/components/RouterTab/install'

Vue.use(RouterTab)

Vue.use(commonFunction)
Vue.use(common_columns)
Vue.prototype.CONSTANTS = constants_type
Vue.prototype.PROGRAMS = constants_program
Vue.prototype.EMITS = constants_emits
Vue.prototype.PARAMETERS = constants_para
Vue.prototype.GLOBAL = global

Vue.use(EventProxy)

Vue.use(Element, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
