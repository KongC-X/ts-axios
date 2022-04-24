// data 有时是不能直接传给 send 函数的，我们需要把它转换成 JSON 字符串
// 实现一个工具函数，对 request 中的 data 做一层转换

import { isPlainObject } from './util'

export function transformRequest(data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  return data
}

// 在我们不去设置 responseType 的情况下，当服务端返回给我们的数据是字符串类型，我们可以尝试去把它转换成一个 JSON 对象。
// 实现一个 transformResponse 工具函数
export function transformResponse(data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {
      // do nothing
    }
  }
  return data
}
