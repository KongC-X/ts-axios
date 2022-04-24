import axios from '../../src/index'
import qs from 'qs' // 一个查询字符串解析和字符串化的库
import { AxiosTransformer } from '../../src/types/index';

// axios.defaults.headers.common['test2'] = 123
// axios({
//   url: '/config/post',
//   method: 'post',
//   data: qs.stringify({
//     a: 1    // {a:1} 经过 qs.stringify 变成 a=1
//   }),
//   headers: {
//     test: '321'
//   }
// }).then((res) => {
//   console.log(res.data)
// })

// 我们对 transformRequest 做了修改，在执行它默认的 transformRequest 之前，我们先用 qs.stringify 库对传入的数据 data 做了一层转换。同时也对 transformResponse 做了修改，在执行完默认的 transformResponse 后，会给响应的 data 对象添加一个 data.b = 2。
// 因为之前我们实现了配置的合并，而且我们传入的 transformRequest 和 transformResponse 遵循默认合并策略，它们会覆盖默认的值。
axios({
  transformRequest: [
    function(data) {
      return qs.stringify(data);
    },
    ...(axios.defaults.transformRequest as AxiosTransformer[]),
  ],
  transformResponse: [
    ...(axios.defaults.transformResponse as AxiosTransformer[]),
    function(data) {
      if (typeof data === "object") {
        data.b = 2;
      }
      return data;
    },
  ],
  url: "/config/post",
  method: "post",
  data: {
    a: 1,
  },
}).then((res) => {
  console.log(res.data);
});

// 目前为止，axios 都是一个单例，一旦我们修改了 axios 的默认配置，会影响所有的请求。
// 因此通过 axios.create 方法创建一个新的实例 instance，并传入了 transformRequest 和 transformResponse 的配置修改了默认配置，然后通过 instance 发送请求，效果和之前是一样的
const instance = axios.create({
  transformRequest: [
    function(data) {
      return qs.stringify(data);
    },
    ...(axios.defaults.transformRequest as AxiosTransformer[]),
  ],
  transformResponse: [
    ...(axios.defaults.transformResponse as AxiosTransformer[]),
    function(data) {
      if (typeof data === "object") {
        data.b = 2;
      }
      return data;
    },
  ],
});
instance({
  url: "/config/post",
  method: "post",
  data: {
    a: 1,
  },
}).then((res) => {
  console.log(res.data);
});
