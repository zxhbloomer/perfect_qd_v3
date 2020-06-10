import { getColumnsSizeApi, saveColumnsSizeApi } from '@/api/00_common/colums_size'

exports.install = function(Vue, options) {
  /**
   * 设置表格上的列宽度，如果有数据
   */
  Vue.prototype.setColumnsSize = function(refTables, page_code, type) {
    // 获取数据
    getColumnsSizeApi({ page_code: page_code, type: type }).then(response => {
      for (const item of response.data) {
        for (const column of refTables.columns) {
          if (item.column_property === column.property) {
            column.realWidth = item.size
            debugger
          }
        }
      }
    }).finally(() => {
    })
  }

  /**
   * 设置表格上的列宽度，如果有数据
   */
  Vue.prototype.saveColumnsSize = function(page_code, column, type) {
    // 获取数据
    saveColumnsSizeApi({ page_code: page_code,
      column_property: column.property,
      type: type,
      size: column.realWidth
    }).then(response => {
    }).finally(() => {
    })
  }
}
