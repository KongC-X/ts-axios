import { isDate,isPlainObject,isURLSearchParams } from './util'

interface URLOrigin {
  protocol: string
  host: string
}

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(url: string, params?: any,paramsSerializer?: (params: any) => string): string{
  if(!params){
    return url
  }

  let serializedParams

  if (paramsSerializer) {
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString() // 如果它是一个 URLSearchParams 对象实例的话，我们直接返回它 toString 后的结果
  } else {
    const parts: string[] = []

  Object.keys(params).forEach((key) => {
    const val = params[key]
    if(val === null || typeof val === 'undefined'){
      return
    }
    // /base/get?foo[]=bar&foo[]=baz
    let values = []
    if(Array.isArray(val)){
      values = val
      key += '[]'
    }else{
      values = [val]
    }
    // /base/get?date=2019-04-01T05:55:39.030Z
    values.forEach((val) => {
      if(isDate(val)){
        val = val.toISOString()
      }else if(isPlainObject(val)){
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')
  }

  // 判断不是一个空数组
  if (serializedParams) {
    const markIndex = url.indexOf('#')   // 判断是否有hash,如果有就把后面的都删除掉
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    // 有问号证明有参数了，直接加&，没问号就加个问号
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }
  return url
}

// 同域名的判断主要利用了一个技巧，创建一个 a 标签的 DOM，然后设置 href 属性为我们传入的 url，然后可以获取该 DOM 的 protocol、host。当前页面的 url 和请求的 url 都通过这种方式获取，然后对比它们的 protocol 和 host 是否相同即可
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)

function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode
  return {
    protocol,
    host
  }
}

// 判断 URL 是否为绝对路径
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

// 拼接 baseURL
export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}
