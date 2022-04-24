// 合并方法的整体思路就是对 config1 和 config2 中的属性遍历，执行 mergeField 方法做合并，这里 config1 代表默认配置，config2 代表自定义配置
// 策 略 模 式

import { AxiosRequestConfig } from "../types";
import { isPlainObject,deepMerge } from "../helpers/util";

const strats = Object.create(null)

// 如果自定义配置中定义了某个属性，就采用自定义的，否则就用默认配置
function defaultStrat(val1: any,val2: any): any{
  return typeof val2 !== 'undefined' ? val2 : val1
}

function formVal2Strat(val1: any,val2: any): any{
  if(typeof val2 !== 'undefined'){
    return val2
  }
}

// 因为对于 url、params、data 这些属性，默认配置显然是没有意义的，它们是和每个请求强相关的，所以我们只从自定义配置中获取
const stratKeysFromVal2 = ['url','params','data']

stratKeysFromVal2.forEach(key => {
  strats[key] = formVal2Strat
})

// 对于 headers 这类的复杂对象属性，合并策略选用深拷贝，同时也处理了其它一些情况，因为它们也可能是一个非对象的普通值。
function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else {
    return val1
  }
}

// const stratKeysDeepMerge = ['headers']
// 修改合并规则，因为 auth 也是一个对象格式，所以它的合并规则是 deepMergeStrat
const stratKeysDeepMerge = ['headers', 'auth']

stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }

  const config = Object.create(null)

  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    if (!config2[key]) { // config2中没有
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }

  return config
}
