import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi(query) {
  return request({
    url: '/api/v1/modulebutton/list',
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
    url: '/api/v1/modulebutton/save',
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
    url: '/api/v1/modulebutton/insert',
    method: 'post',
    data
  })
}

/**
 * 删除逻辑
 * @param {*} data
 */
export function deleteApi(data) {
  return request({
    url: '/api/v1/modulebutton/delete',
    method: 'post',
    data
  })
}

/**
 * 排序逻辑
 * @param {*} data
 */
export function saveListApi(data) {
  return request({
    url: '/api/v1/modulebutton/save_list',
    method: 'post',
    data
  })
}

/**
 * 物理删除选择数据
 * @param {*} data
 */
export function realDeleteSelectionApi(data) {
  return request({
    url: '/api/v1/modulebutton/delete',
    method: 'post',
    data
  })
}
