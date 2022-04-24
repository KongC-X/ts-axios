import { AxiosRequestConfig,AxiosPromise,AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers';
import { createError } from '../helpers/error'
import cookie from '../helpers/cookie';
import { isURLSameOrigin } from '../helpers/url';
import { isFormData } from '../helpers/util';

// 整个流程分为 7 步：
// 创建一个 request 实例。
// 执行 request.open 方法初始化。
// 执行 configureRequest 配置 request 对象。
// 执行 addEvents 给 request 添加事件处理函数。
// 执行 processHeaders 处理请求 headers。
// 执行 processCancel 处理请求取消逻辑。
// 执行 request.send 方法发送请求。

// 实现 axios 函数的 Promise 化
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve,reject) => {
    const { url, data = null, method = 'get', headers={},responseType,timeout,cancelToken,withCredentials,xsrfCookieName,xsrfHeaderName,onDownloadProgress,
    onUploadProgress,auth, validateStatus } = config  // 解构赋值

    const request = new XMLHttpRequest() // 创建一个 request 实例

    // // 执行 request.open 方法初始化
    request.open(method.toUpperCase(), url!, true) // !类型断言，因为url设为可选了

    configureRequest()  // 执行 configureRequest 配置 request 对象

    addEvents() // 执行 addEvents 给 request 添加事件处理函数

    processHeaders() // 执行 processHeaders 处理请求 headers

    processCancel() // 执行 processCancel 处理请求取消逻辑

    request.send(data) // 执行 request.send 方法发送请求

    function configureRequest(): void {
    // 这里判断了如果config中配置了responseType，把它设置到request.responseType中。
      if(responseType){
        request.responseType = responseType
      }
      if(timeout){
        request.timeout = timeout
      }
      // 跨域
      // 携带cookie，只需要设置请求的 xhr 对象的 withCredentials 为 true
      if (withCredentials) {
        request.withCredentials = true;
      }
    }

    function addEvents(): void {
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) {
          return
        }

        // 当出现网络错误或者超时错误的时候，status值为0
        if (request.status === 0) {
          return
        }

        // 在onreadystatechange事件函数中，构造了AxiosResponse类型的response对象，并把它resolve出去
        // const responseHeaders = request.getAllResponseHeaders()
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())

        const responseData = responseType && responseType !== 'text' ? request.response : request.responseText
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        handleResponse(response)
      }
    }

    // 当网络出现异常（比如不通）的时候发送请求会触发 XMLHttpRequest 对象实例的 error 事件，可以在onerror的事件回调函数中捕获此类错误
    request.onerror = function handleError(){
      // reject(new Error('Network Error'))
      reject(createError(
        'Network Error',
        config,
        null, // code
        request
      ))
    }

    request.ontimeout = function handleTimeout() {
      // reject(new Error(`Timeout of ${timeout} ms exceeded`))
      reject(createError(
        `Timeout of ${config.timeout} ms exceeded`,
        config,
        'ECONNABORTED', // code：software caused connection abort 软件引起的连接中止
        request
      ))
    }

    // 我们希望给 axios 的请求配置提供 onDownloadProgress 和 onUploadProgress 2 个函数属性，用户可以通过这俩函数实现对下载进度和上传进度的监控
    if (onDownloadProgress) {
      request.onprogress = onDownloadProgress
    }
    if (onUploadProgress) {
      request.upload.onprogress = onUploadProgress
    }

    function processHeaders(): void {
    // 如果请求的数据是 FormData 类型，我们应该主动删除请求 headers 中的 Content-Type 字段，让浏览器自动根据请求数据设置 Content-Type
    if (isFormData(data)) {
      delete headers['Content-Type']
    }

    // CSRF
    // 首先判断如果是配置 withCredentials 为 true 或者是同域请求，我们才会请求 headers 添加 xsrf 相关的字段
    // 如果判断成功，尝试从 cookie 中读取 xsrf 的 token 值
    // 如果能读到，则把它添加到请求 headers 的 xsrf 相关字段中
    if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName){
      const xsrfValue = cookie.read(xsrfCookieName)
      if (xsrfValue) {
        headers[xsrfHeaderName!] = xsrfValue
      }
    }
  }

    // axios 库也允许在请求配置中配置 auth 属性，auth 是一个对象结构，包含 username 和 password 2 个属性。一旦用户在请求的时候配置这俩属性，我们就会自动往 HTTP 的 请求 header 中添加 Authorization 属性，它的值为 Basic 加密串。 这里的加密串是 username:password base64 加密后的结果
    // 安装第三方库 atob 实现 base64 串的解码
    if (auth) {
      headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
    }

    // 如果是 2xx 的状态码，则认为是一个正常的请求，否则抛错。
    function handleResponse(response: AxiosResponse) {
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response)
      } else {
        // reject(new Error(`Request failed with status code ${response.status}`))
        reject(createError(
          `Request failed with status code ${response.status}`,
          config,
          null,
          request,
          response
        ))
      }
    }

    Object.keys(headers).forEach((name) => {
    // 当传入的 data 为空，请求 header 配置 Content-Type 是没有意义的，所以把它删除
      if(data === null && name.toLowerCase() === 'content-type'){
        delete headers[name]
      }else{
        request.setRequestHeader(name, headers[name])
      }
    })

    function processCancel(): void {
    // 取消请求
    if (cancelToken) {
      // 报错可以用 return 解决
      // tslint:disable-next-line: no-floating-promises
      cancelToken.promise.then(reason => {
        request.abort()   // 终止请求
        reject(reason)
      })
    }
  }
  })
}
