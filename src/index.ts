// 在 demo 中，TypeScript 并不能把 e 参数推断为 AxiosError 类型，于是我们需要手动指明类型，为了让外部应用能引入 AxiosError 类型，我们也需要把它们导出。
// 创建 axios.ts 文件，把之前的 index.ts 的代码拷贝过去，然后修改 index.ts 的代码。

import axios from './axios'

export * from './types'

export default axios
