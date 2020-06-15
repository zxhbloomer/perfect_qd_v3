import { saveColumnsSizeApi } from '@/api/00_common/colums_size'

exports.install = function(Vue, options) {
  /**
   * 设置表格上的列宽度，如果有数据
   */
  Vue.prototype.saveColumnsSize = function(table_obj, page_code, column, type) {
    // 获取当前列的index
    let column_index = 0
    for (var i = 0; i < this.columns.length; i++) {
      if (this.columns[i].id === column.id) {
        column_index = i
        break
      }
    }
    // 获取数据
    saveColumnsSizeApi({ page_code: page_code,
      column_label: column.label,
      column_property: column.property,
      column_index: column_index,
      type: type,
      min_width: column.minWidth,
      real_width: column.realWidth
    }).then(response => {
    }).finally(() => {
    })
  }
}
