import { getColumnsSizeApi } from '@/api/00_common/colums_size'

exports.install = function(Vue, options) {
  Vue.prototype.setColumnsSize = function(refTables, page_info) {
    // 获取数据
    getColumnsSizeApi({}).then(response => {
      // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
      this.dataJson.listData = response.data.records
      this.dataJson.paging = response.data
      this.dataJson.paging.records = {}
    }).finally(() => {
      this.settings.loading = false
    })
    return null
  }
}
