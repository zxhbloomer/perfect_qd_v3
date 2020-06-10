import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getCascaderListApi(query) {
  return request({
    url: '/api/v1/tenant/cascader/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getTreeListApi(query) {
  return request({
    url: '/api/v1/tenant/tree/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi(query) {
  return request({
    url: '/api/v1/tenant/list',
    method: 'post',
    data: query
  })
}

/**
 * 更新api
 * @param {*} data
 */
export function updateApi(data) {
  return request({
    url: '/api/v1/tenant/save',
    method: 'post',
    data
  })
}

/**
 * 插入api
 * @param {*} data
 */
export function insertApi(data) {
  return request({
    url: '/api/v1/tenant/insert',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑，全部导出
 * @param {*} data
 */
export function exportAllApi(data) {
  return request({
    url: '/api/v1/tenant/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑，部分导出
 * @param {*} data
 */
export function exportSelectionApi(data) {
  return request({
    url: '/api/v1/tenant/export_selection',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 启用逻辑
 * @param {*} data
 */
export function enableApi(data) {
  return request({
    url: '/api/v1/tenant/enable',
    method: 'post',
    data
  })
}
