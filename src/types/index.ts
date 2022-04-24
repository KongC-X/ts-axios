export type Method = 'get' | 'GET'
  | 'delete' | 'Delete'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'

export interface AxiosRequestConfig {
  url?: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType // XMLHttpRequestResponseType的定义是 "" | "arraybuffer" | "blob" | "document" | "json" | "text" 字符串字面量类型
  timeout?: number // 设置某个请求的超时时间 timeout，也就是当请求发送后超过某个时间后仍然没收到响应，则请求自动终止，并触发 timeout 事件

  // transformRequest 允许在将请求数据发送到服务器之前对其进行修改
  // transformResponse 允许在把响应数据传递给 then 或者 catch 之前对它们进行修改
  // 它们的值是一个数组或者是一个函数
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]

  // 遍历过程中，通过 config2[key] 这种索引的方式访问，所以需要给 AxiosRequestConfig 的接口定义添加一个字符串索引签名
  [propName: string]: any

  cancelToken?: CancelToken // 取消请求

  withCredentials?: boolean; // 跨域

  xsrfCookieName?: string // 表示存储 token 的 cookie 名称
  xsrfHeaderName?: string // 表示请求 headers 中 token 对应的 header 名称

  onDownloadProgress?: (e: ProgressEvent) => void // 下载
  onUploadProgress?: (e: ProgressEvent) => void // 上传

  auth?: AxiosBasicCredentials

  validateStatus?: (status: number) => boolean // 根据参数 status 来自定义合法状态码的规则

  paramsSerializer?: (params: any) => string // 自定义参数的解析规则，该函数接受 params 参数，返回值作为解析后的结果

  baseURL?: string
}

// 为了让响应数据支持泛型，给相关的接口定义添加泛型参数
// T=any 表示泛型的类型参数默认值为 any
export interface AxiosResponse<T = any> {
  data: T // any
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

// axios 函数返回的是一个 Promise 对象，可以定义一个 AxiosPromise 接口，它继承于 Promise<AxiosResponse> 这个泛型接口
// 当 axios 返回的是 AxiosPromise 类型，那么 resolve 函数中的参数就是一个 AxiosResponse 类型
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {
}

// 我们希望对外提供的信息不仅仅包含错误文本信息，还包括了请求对象配置 config，错误代码 code，XMLHttpRequest 对象实例 request 以及自定义响应对象 response。这样应用方就可以捕获到这些错误的详细信息，做进一步的处理。
// 对错误信息做增强
export interface AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse
  isAxiosError: boolean
}

// 首先定义一个 Axios 类型接口，它描述了 Axios 类中的公共方法
export interface Axios {
  defaults: AxiosRequestConfig
  interceptors:{
    request:AxiosInterceptorManager<AxiosRequestConfig>
    response:AxiosInterceptorManager<AxiosResponse>
  }

  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  getUri(config?: AxiosRequestConfig): string;
}

// 定义 AxiosInstance 接口继承 Axios，它就是一个混合类型的接口
export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  // 函数能支持传入 2 个参数 , 函数重载
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

// 定义了 AxiosInterceptorManager 泛型接口，因为对于 resolve 函数的参数，请求拦截器和响应拦截器是不同的
export interface AxiosInterceptorManager<T> {
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number

  eject(id: number): void
}

export interface ResolvedFn<T=any> {
  (val: T): T | Promise<T> // 同步或者异步
}

export interface RejectedFn {
  (error: any): any
}

export interface AxiosTransformer {
  (data: any, headers?: any): any;
}

// 由于 axios 扩展了一个静态接口，因此先修改接口类型定义
export interface AxiosStatic extends AxiosInstance {
  // create 函数接受一个 AxiosRequestConfig 类型的配置，作为默认配置的扩展，也可以接受不传参数
  create(config?: AxiosRequestConfig): AxiosInstance;

  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  isCancel: (value: any) => boolean

  all<T>(promises: Array<T | Promise<T>>): Promise<T[]>;
  spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R;
  Axios: AxiosClassStatic;
}

// 实例类型的接口定义
export interface CancelToken {
  promise: Promise<Cancel>
  // 修改定义部分 reason?: string
  // 对 CancelToken 类中的 reason 类型做修改，把它变成一个 Cancel 类型的实例
  reason?: Cancel

  // 当一个请求携带的 cancelToken 已经被使用过,可以不发送这个请求,只需要抛一个异常即可
  throwIfRequested(): void
}

// 取消方法的接口定义
export interface Canceler {
  (message?: string): void
}

// CancelExecutor 是 CancelToken 类构造函数参数的接口定义
export interface CancelExecutor {
  (cancel: Canceler): void
}

// 作为 CancelToken 类静态方法 source 函数的返回值类型
export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}

// 作为 CancelToken 类的类类型
export interface CancelTokenStatic {
  new(executor: CancelExecutor): CancelToken

  source(): CancelTokenSource
}

// Cancel 是实例类型的接口定义
export interface Cancel {
  message?: string
}

// CancelStatic 是类类型的接口定义
export interface CancelStatic {
  new(message?: string): Cancel
}

export interface AxiosBasicCredentials {
  username: string
  password: string
}


export interface AxiosClassStatic {
  new (config: AxiosRequestConfig): Axios;
}
