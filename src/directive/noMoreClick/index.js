import noMoreClick from './noMoreClick'

const install = function(Vue) {
  Vue.directive('no-more-click', noMoreClick)
}

if (window.Vue) {
  window['no-more-click'] = noMoreClick
  Vue.use(install); // eslint-disable-line
}

noMoreClick.install = install
export default noMoreClick
