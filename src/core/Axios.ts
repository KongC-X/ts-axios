// 创建一个 core 目录，用来存放发送请求核心流程的代码
// 创建一个 Axios 类，来实现接口定义的公共方法
// 对于 get、delete、head、options、post、patch、put 这些方法，都是对外提供的语法糖，内部都是通过调用 request 方法实现发送请求，只不过在调用之前对 config 做了一层合并处理。

import { AxiosRequestConfig, AxiosPromise,AxiosResponse, Method,ResolvedFn,RejectedFn } from '../types'
import dispatchRequest,{transformURL} from './dispatchRequest'
import InterceptorManager from './InterceptorManager';
import mergeConfig from './mergeConfig';

// Interceptors 类型拥有 2 个属性，一个请求拦截器管理类实例，一个是响应拦截器管理类实例
interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChain {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

export default class Axios {
  // 给 Axios 类添加一个 defaults 成员属性
  defaults: AxiosRequestConfig

  interceptors:Interceptors
  // 在实例化 Axios 类的时候，在它的构造器去初始化这个 interceptors 实例属性
  constructor(initConfig: AxiosRequestConfig) {
    // 让 Axios 的构造函数接受一个 initConfig 对象，把 initConfig 赋值给 this.defaults
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  // request(config: AxiosRequestConfig): AxiosPromise {
  //   return dispatchRequest(config)
  // }
  // 函数重载
  // 修改 request 方法的逻辑，添加拦截器链式调用的逻辑
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}  // 可能不传,如果为空则构造一个空对象
      }
      config.url = url
    } else {
      config = url // 如果 url 不是字符串类型，则说明传入的就是单个参数，且 url 就是 config
    }

    // 在 request 方法里添加合并配置的逻辑
    config = mergeConfig(this.defaults, config)
    // 发送请求的 method 需要转换成小写字符串，这么做的目的也是为了之后 flattenHeaders 能正常处理这些 method
    config.method = config.method.toLowerCase()

    // 构造 PromiseChain 类型的数组 chain，并把 dispatchRequest 函数赋值给 resolved 属性
    const chain: PromiseChain[] = [{
      resolved: dispatchRequest,
      rejected: undefined
    }]

    // 注意拦截器的执行顺序，对于请求拦截器，先执行后添加的，再执行先添加的；
    // 而对于响应拦截器，先执行先添加的，后执行后添加的。

    // 先遍历请求拦截器插入到 chain 的前面
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })

    // 再遍历响应拦截器插入到 chain 后面
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    // 定义一个已经 resolve 的 promise
    let promise = Promise.resolve(config)

    // 循环这个 chain，拿到每个拦截器对象，把它们的 resolved 函数和 rejected 函数添加到 promise.then 的参数中，这样就相当于通过 Promise 的链式调用方式，实现了拦截器一层层的链式调用的效果
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      // Object.assign () 是对象的静态方法，可以用来复制对象的可枚举属性到目标对象，利用这个特性可以实现对象属性的合并。 Object.assign(target, sources)。如果只是想将两个或多个对象的属性合并到一起，不改变原有对象的属性，可以用一个空的对象作为 target 对象：Object.assign({},target,source)
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }
}
