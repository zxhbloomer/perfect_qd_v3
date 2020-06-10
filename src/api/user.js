import request from '@/utils/request'

// update by zxh
export function loginApi(data) {
  return request({
    url: '/api/v1/user/token/get',
    method: 'post',
    data
  })
}

export function getUserInfoApi(token) {
  return request({
    url: '/api/v1/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/api/v1/user/logout',
    method: 'post'
  })
}

export function getUserBeanByIdApi(data) {
  return request({
    url: '/api/v1/user/list',
    method: 'post',
    data
  })
}

export function getUsrPsdStringApi(data) {
  return request({
    url: '/api/v1/user/getpsd',
    method: 'post',
    data
  })
}
