import { TableColumn } from 'element-ui'

export default {
  name: 'ExTableColumn',

  extends: TableColumn,

  props: {
    maxWidth: {
      type: Number
    }
  }
}