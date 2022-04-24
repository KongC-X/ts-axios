import { AxiosInstance } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import { AxiosRequestConfig,AxiosStatic } from './types/index';
import mergeConfig from './core/mergeConfig';
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

// 执行 createInstance 创建 axios 对象的时候，把默认配置传入
// 这里把 createInstance 函数的返回值类型改为 AxiosStatic
function createInstance(config:AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config) // 实例化了 Axios 实例 context
  const instance = Axios.prototype.request.bind(context) // 创建 instance 指向 Axios.prototype.request 方法，因为用了 this，所以绑定了上下文 context

  extend(instance, context) // 通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上

  // 这样就实现了一个混合对象: instance 本身是一个函数，又拥有了 Axios 类的所有原型和实例属性，最终把这个 instance 返回

  return instance as AxiosStatic  // 不能正确推断 instance 的类型，把它断言成 AxiosInstance 类型
  // 改为 AxiosStatic
}

// 这样就通过 createInstance 工厂函数创建了 axios，当直接调用 axios 方法就相当于执行了 Axios 类的 request 方法发送请求，当然我们也可以调用 axios.get、axios.post 等方法。
const axios = createInstance(defaults)

// 内部调用了 createInstance 函数，并且把参数 config 与 defaults 合并，作为新的默认配置
axios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config));
};

axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

axios.Axios = Axios;

export default axios
