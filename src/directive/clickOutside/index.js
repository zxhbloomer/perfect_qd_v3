import clickOutSide from './clickOutSide'

const install = function(Vue) {
  Vue.directive('click-outside', clickOutSide)
}

if (window.Vue) {
  window['click-outside'] = clickOutSide
  Vue.use(install); // eslint-disable-line
}

clickOutSide.install = install
export default clickOutSide
