const toString = Object.prototype.toString  // 判断类型的方法 Object.prototype.toString.call()

// 类型保护 val is Date
export function isDate(val :any): val is Date{
  return toString.call(val) === '[object Date]'
}

// export function isObject(val: any): val is Object{
//   return val !== null && typeof val === 'object'
// }

// isObject 的判断方式，对于 FormData、ArrayBuffer 这些类型，isObject 判断也为 true，但是这些类型的数据我们是不需要做处理的。而 isPlainObject 的判断方式，只有我们定义的普通 JSON 对象才能满足
export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

// export function isObject(val: any): boolean{
//   return val !== null && typeof val === 'object'
// }

// extend 方法的实现用到了交叉类型，并且用到了类型断言。
// extend 的最终目的是把 from 里的属性都扩展到 to 中，包括原型上的属性。
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    // to[key] = from[key]
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}

// 合并配置深拷贝
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge({}, val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })
  return result
}

// 判断请求的数据是否为 FormData 类型
// 如果请求的数据是 FormData 类型，我们应该主动删除请求 headers 中的 Content-Type 字段，让浏览器自动根据请求数据设置 Content-Type。比如当我们通过 FormData 上传文件的时候，浏览器会把请求 headers 中的 Content-Type 设置为 multipart/form-data
export function isFormData(val: any): boolean {
  return typeof val !== 'undefined' && val instanceof FormData
}

// 对 params 类型判断是否为一个 URLSearchParams 对象实例
export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
}
