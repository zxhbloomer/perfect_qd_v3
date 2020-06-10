import adaptive from './adaptive'

const install = function(Vue) {
  Vue.directive('el-columns-size', adaptive)
}

if (window.Vue) {
  window['el-columns-size'] = adaptive
  Vue.use(install); // eslint-disable-line
}

adaptive.install = install
export default adaptive
