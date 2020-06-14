import { Table } from 'element-ui'

import { getColumnsSizeApi } from '@/api/00_common/colums_size'

export default {
  name: 'ElTable',
  extends: Table,
  props: {
    // 启用列调整后记录模式
    setColumnSize: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: undefined
    }
  },
  created() {
    if (this.setColumnSize) {
      // 设置拖动列宽的事件
      this.$on('header-dragend', function(newWidth, oldWidth, column, event) {
        this.saveColumnsSize(this.$parent.$options.name, column)
      })
    }
  },
  mounted() {
    // 描绘完成
  },
  updated() {
    const { componentInstance: $table } = this.$vnode
    if (!$table) { return }
    // 设置参数
    const page_code = $table.$parent.$options.name
    let table_type
    if (this.type) {
      table_type = this.type
    }

    // 调用
    this.setColumnsSize($table, page_code, table_type)

    $table.doLayout()
  },
  methods: {
    async setColumnsSize(table_object, page_code, table_type) {
      // 获取数据
      await getColumnsSizeApi({ page_code: page_code, type: table_type }).then(response => {
        for (const item of response.data) {
          for (const column of table_object.columns) {
            if (item.column_property === column.property) {
              // column.minWidth = item.min_width
              column.width = item.real_width
            }
          }
        }
      }).finally(() => {
      })
    }
  }
}
