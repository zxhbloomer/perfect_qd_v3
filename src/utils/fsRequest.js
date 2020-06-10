import axios from 'axios'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_FILE_SYSTEM_UPLOAD_URL, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 55000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    return Promise.resolve(res)
  },
  error => {
    console.log('err' + error) // for debug
    // upd by zxh
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    // return Promise.reject(error)
    if (error.response) {
      // switch (error.response.status) {
      //   case 401:
      //     // 返回 401 清除token信息并跳转到登录页面
    }
    return Promise.reject(error.response.data) // 返回接口返回的错误信息
  },
)

export default service
