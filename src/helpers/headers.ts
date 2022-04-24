// 实现一个工具函数，对 request 中的 headers 做一层加工
// 当传入的 data 为普通对象的时候，headers 如果没有配置 Content-Type 属性，需要自动设置请求 header 的 Content-Type 字段为：application/json;charset=utf-8

import { isPlainObject, deepMerge } from './util';
import { Method } from '../types/index';

// 请求 header 属性是大小写不敏感的，所以先要把 header 属性名规范化
function normalizeHeaderName (headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders (headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

// 通过 XMLHttpRequest 对象的 getAllResponseHeaders 方法获取到的值是一段字符串
// 每一行都是以回车符和换行符 \r\n 结束，它们是每个 header 属性的分隔符。对于这串字符串，我们希望最终解析成一个对象结构
// 根据上述需求分析，实现一个 parseHeaders 工具函数
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null)
  if (!headers) {
    return parsed
  }
  // split()方法用于把一个字符串分割成字符串数组
  headers.split('\r\n').forEach(line => {
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return
    }
    let val = vals.join(':').trim()
    parsed[key] = val
  })
  return parsed
}

// 经过合并后的配置中的 headers 是一个复杂对象，多了 common、post、get 等属性，而这些属性中的值才是我们要真正添加到请求 header 中的
// 我们要把 headers 压成一级
// 对于 common 中定义的 header 字段，我们都要提取，而对于 post、get 这类提取，需要和该次请求的方法对应
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  // 通过 deepMerge 的方式把 common、post 的属性拷贝到 headers 这一级，然后再把 common、post 这些属性删掉
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  methodsToDelete.forEach(method => {
    delete headers[method]
  })
  return headers
}
