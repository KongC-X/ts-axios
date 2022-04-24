// 异步分离的设计方案
// 想要实现取消某次请求，我们需要为该请求配置一个 cancelToken，然后在外部调用一个 cancel 方法。
// 请求的发送是一个异步过程，最终会执行 xhr.send 方法，xhr 对象提供了 abort 方法，可以把请求取消。因为我们在外部是碰不到 xhr 对象的，所以我们想在执行 cancel 的时候，去执行 xhr.abort 方法。现在就相当于我们在 xhr 异步请求过程中，插入一段代码，当我们在外部执行 cancel 函数的时候，会驱动这段代码的执行，然后执行 xhr.abort 方法取消请求
// 我们可以利用 Promise 实现异步分离，也就是在 cancelToken 中保存一个 pending 状态的 Promise 对象，然后当我们执行 cancel 方法的时候，能够访问到这个 Promise 对象，把它从 pending 状态变成 resolved 状态，这样我们就可以在 then 函数中去实现取消请求的逻辑
import { CancelExecutor,CancelTokenSource,Canceler } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  // 修改实现部分
  // (reason?: string): void
  (reason?: Cancel): void
}

export default class CancelToken {
  // promise: Promise<string>
  // reason?: string
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    // 实例化一个 pending 状态的 Promise 对象，然后用一个 resolvePromise 变量指向 resolve 函数
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    // 执行 executor 函数，传入一个 cancel 函数，在 cancel 函数内部，会调用 resolvePromise 把 Promise 对象从 pending 状态变为 resolved 状态
    executor(message => {
      if (this.reason) {
        return
      }
      // this.reason = message
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  // 定义一个 cancel 变量实例化一个 CancelToken 类型的对象，然后在 executor 函数中，把 cancel 指向参数 c 这个取消函数
  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }

  // 判断如果存在 this.reason，说明这个 token 已经被使用过了，直接抛错
  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }
}
