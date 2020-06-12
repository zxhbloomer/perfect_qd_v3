import ExTableColumn from './ExTableColumn.js'

ExTableColumn.install = (Vue, options) => {
  Vue.prototype.$ELEMENT = options
  Vue.component(ExTableColumn.name, ExTableColumn)
}

export default ExTableColumn
