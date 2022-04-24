import axios from '../../src/index'

axios({
  url: '/extend/post',
  method: 'post',
  data: {
    msg: 'hi'
  }
})

axios("/extend/post", {
  method: "post",
  data: {
    msg: "hello",
  },
});

axios.get('/extend/get')
axios.options('/extend/options')
axios.delete('/extend/delete')
axios.head('/extend/head')
axios.post('/extend/post', { msg: 'post' })
axios.put('/extend/put', { msg: 'put' })
axios.patch('/extend/patch', { msg: 'patch' })


// 当调用 getUser<User> 的时候，相当于调用了 axios<ResponseData<User>>，也就是我们传入给 axios 函数的类型 T 为 ResponseData<User>；相当于返回值 AxiosPromise<T> 的 T，实际上也是 Promise<AxiosResponse<T>> 中的 T 的类型是 ResponseData<User>，所以响应数据中的 data 类型就是 ResponseData<User>
interface ResponseData<T = any> {
  code: number
  result: T
  message: string
}
interface User {
  name: string
  age: number
}
function getUser<T>() {
  return axios<ResponseData<T>>('/extend/user')
    .then(res => res.data)
    .catch(err => console.error(err))
}
async function test() {
  const user = await getUser<User>()
  if (user) {
    console.log(user.result.name)
  }
}
test()
