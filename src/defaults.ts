// 在发送请求的时候可以传入一个配置，来决定请求的不同行为。
// 我们希望 ts-axios 可以有默认配置，定义一些默认的行为。这样在发送每个请求，用户传递的配置可以和默认配置做一层合并。
// 和官网 axios 库保持一致，我们给 axios 对象添加一个 defaults 属性，表示默认配置。
// 其中对于 headers 的默认配置支持 common 和一些请求 method 字段，common 表示对于任何类型的请求都要添加该属性，而 method 表示只有该类型请求方法才会添加对应的属性。

import { AxiosRequestConfig } from './types/index';
import { processHeaders } from "./helpers/headers";
import { transformRequest, transformResponse } from "./helpers/data";

// 定义 defaults 常量，包含默认请求的方法、超时时间，以及 headers 配置
const defaults: AxiosRequestConfig = {
  method:'get',
  timeout:0,
  headers:{
    common:{
      Accept:'application/json,text/plain,*/*'
    }
  },

  xsrfCookieName: 'XSRF-TOKEN', // 默认配置
  xsrfHeaderName: 'X-XSRF-TOKEN', // 默认配置

  // 修改默认配置。把之前对请求数据和响应数据的处理逻辑，放到了默认配置中，也就是默认处理逻辑
  transformRequest: [
    function(data: any, headers: any): any {
      processHeaders(headers, data);
      return transformRequest(data);
    },
  ],
  transformResponse: [
    function(data: any): any {
      return transformResponse(data);
    },
  ],

  // 用户可以配置 validateStatus 自定义合法状态码规则
  validateStatus(status: number): boolean {
    return status >= 200 && status < 300
  }
}

const methodsNoData = ['delete','get','head','options']

methodsNoData.forEach(method => {
  defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']

methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})



export default defaults
