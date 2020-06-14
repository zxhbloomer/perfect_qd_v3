import { getColumnsSizeApi } from '@/api/00_common/colums_size'

const setColumnsSize = async function(table_object, page_code, table_type) {
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

export default {
  bind(el, binding, vnode) {
  },
  inserted(el, binding, vnode) {
  },
  update(el, binding, vnode) {
    const { componentInstance: $table } = vnode
    if (!$table) { return }
    // 设置参数
    const page_code = $table.$parent.$options.name
    let table_type
    if (binding.value && binding.value.type) {
      table_type = binding.value.type
    }

    // 调用
    setColumnsSize($table, page_code, table_type)

    $table.doLayout()
  },
  componentUpdated(el, binding, vnode) {
  },
  unbind(el) {
  }
}
