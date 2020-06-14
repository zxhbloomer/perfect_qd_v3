
import { TableColumn } from 'element-ui'
import {
  parseMinWidth
} from 'element-ui/packages/table/src/util.js'
import { max, map, isEmpty } from './configs/util.js'

export default {
  name: 'ExTableColumn',
  extends: TableColumn, // 指定继承组件
  props: {
    fitByClass: {
      type: String,
      default: 'cell'
    },
    autoFit: {
      type: Boolean,
      default: false
    },
    fitGap: {
      type: Number,
      default: 0
    },
    fitHeader: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      autoWidth: 0
    }
  },
  computed: {
    realMinWidth() {
      if (this.autoFit) {
        const width = 100
        return parseMinWidth(width)
      }
      return TableColumn.computed.realMinWidth.call(this)
    }
  },
  updated() {
    debugger
    this.updateAutoWidth()
    debugger
  },
  mounted() {
    this.$nextTick(this.updateAutoWidth)
  },
  methods: {
    updateAutoWidth() {
      if (!this.autoFit) return
      const cellWrapperClass = `.${this.columnId}`

      let cells = window.document.querySelectorAll(`${cellWrapperClass} .${this.fitByClass}`)
      if (isEmpty(cells)) {
        cells = window.document.querySelectorAll(`${cellWrapperClass} .cell`)
      }
      if (isEmpty(cells)) {
        return
      }

      const autoMinWidth = max(map(cells, item => item.getBoundingClientRect().width)) + this.fitGap + 1

      if (this.autoWidth !== autoMinWidth) {
        this.autoWidth = autoMinWidth
      }
    }
  }
}
