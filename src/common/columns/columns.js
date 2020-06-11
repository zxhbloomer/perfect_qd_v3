import { getColumnsSizeApi, saveColumnsSizeApi } from '@/api/00_common/colums_size'

exports.install = function(Vue, options) {
  /**
   * 设置表格上的列宽度，如果有数据
   */
  Vue.prototype.setColumnsSize = async function(width_data_json, page_code, type) {
    this.$refs.multipleTable.columns[2].realWidth = 1000
    // 获取数据
    await getColumnsSizeApi({ page_code: page_code, type: type }).then(response => {
      for (const item of response.data) {
        for (const column in width_data_json) {
          if (item.column_property === column) {
            // column.minWidth = item.min_width
            width_data_json[column] = item.real_width
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
      min_width: column.minWidth,
      real_width: column.realWidth
    }).then(response => {
    }).finally(() => {
    })
  }
}
