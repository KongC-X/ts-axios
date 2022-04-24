import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL,isAbsoluteURL,combineURL } from '../helpers/url'
import { transformRequest, transformResponse } from '../helpers/data'
import { processHeaders,flattenHeaders } from '../helpers/headers'
import transform from "./transform";
import { isURLSearchParams } from '../helpers/util';

// 其中 request 方法的功能和之前的 axios 函数功能是一致。axios 函数的功能就是发送请求，基于模块化编程的思想，我们把这部分功能抽出一个单独的模块，在 core 目录下创建 dispatchRequest 方法，把之前 axios.ts 的相关代码拷贝过去。然后把 xhr.ts 文件也迁移到 core 目录下。

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config) // 在发送请求前增加一段逻辑
  processConfig(config)
  return xhr(config).then(
    res => {
    return transformResponseData(res)
  },
  // 当我们发送请求失败后，也能把响应数据转换成 JSON 格式
  e => {
    if (e && e.response) {
      e.response = transformResponseData(e.response)
    }
    return Promise.reject(e)
  }
  )
}

// 发送请求前检查一下配置的 cancelToken 是否已经使用过了，如果已经被用过则不用发请求，直接抛异常。
function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  // config.headers = transformHeaders(config)
  // config.data = transformRequestData(config)
  config.data = transform(config.data, config.headers, config.transformRequest);
  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  let { url, params,paramsSerializer,baseURL } = config
  // 我们一旦配置了 baseURL，之后请求传入的 url 都会和我们的 baseURL 拼接成完整的绝对地址，除非请求传入的 url 已经是绝对地址
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params,paramsSerializer) // !类型断言，因为url设为可选了
}

// function transformRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data)
// }

// function transformHeaders(config: AxiosRequestConfig) {
//   const { headers = {}, data } = config
//   return processHeaders(headers, data)
// }

function transformResponseData(res: AxiosResponse): AxiosResponse {
  // res.data = transformResponse(res.data)
  res.data = transform(res.data, res.headers, res.config.transformResponse);
  return res
}
