import { Table } from 'element-ui'

import { getColumnsSizeApi, saveColumnsSizeApi } from '@/api/00_common/colums_size'

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
    },
    page_code: {
      type: String,
      default: undefined
    }
  },
  created() {
    if (this.setColumnSize) {
      // 设置拖动列宽的事件
      this.$on('header-dragend', function(newWidth, oldWidth, column, event) {
        this.saveColumnsSize(this, this.$parent.$options.name, column)
      })
    }
  },
  mounted() {
    // 描绘完成
    const { componentInstance: $table } = this.$vnode
    if (!$table) { return }
    // 设置参数
    const page_code = $table.$parent.$options.name
    let table_type
    if (this.type) {
      table_type = this.type
    }

    // 调用调整列宽方法
    this.setColumnsSize($table, page_code, table_type)
    $table.doLayout()
  },
  updated() {
  },
  methods: {

    // 设置表格上的列宽度，如果有数据
    saveColumnsSize(table_obj, page_code, column) {
      // 获取当前列的index
      let column_index = 0
      for (var i = 0; i < table_obj.columns.length; i++) {
        if (table_obj.columns[i].id === column.id) {
          column_index = i
          break
        }
      }
      // 获取数据
      saveColumnsSizeApi({ page_code: page_code,
        column_label: column.label,
        column_property: column.property,
        column_index: column_index,
        type: this.type,
        min_width: column.minWidth,
        real_width: column.realWidth
      }).then(response => {
      }).finally(() => {
      })
    },
    // 调整列宽方法
    setColumnsSize(table_object, page_code, table_type) {
      // 获取数据
      getColumnsSizeApi({ page_code: page_code, type: table_type }).then(response => {
        for (const item of response.data) {
          // for (const column of table_object.columns) {
          //   if (item.column_id === column.id) {
          //     column.width = item.real_width
          //   }
          // }
          table_object.columns[item.column_index].width = item.real_width
          table_object.columns[item.column_index].realWidth = item.real_width
        }
      }).finally(() => {
        table_object.doLayout()
      })
    }
  }
}
