import axios from "../../src/index";
import 'nprogress/nprogress.css'
import NProgress from 'nprogress'
import { AxiosError } from '../../src/types/index';

// document.cookie = "a=b";

// axios.get("/more/get").then((res) => {
//   console.log(res);
// });

// axios
//   .post(
//     "http://127.0.0.1:8088/more/server2",
//     {},
//     {
//       withCredentials: true,
//     }
//   )
//   .then((res) => {
//     console.log(res);
//   });


// const instance = axios.create({
//   xsrfCookieName: 'XSRF-TOKEN-D',
//   xsrfHeaderName: 'X-XSRF-TOKEN-D'
// })

// instance.get('/more/get').then(res => {
//   console.log(res)
// })


// 对于 progress 事件参数 e，会有 e.total 和 e.loaded 属性，表示进程总体的工作量和已经执行的工作量，我们可以根据这 2 个值算出当前进度，然后通过 Nprogress.set 设置。另外，我们通过配置请求拦截器和响应拦截器执行 NProgress.start() 和 NProgress.done()。
// 我们给下载按钮绑定了一个 click 事件，请求一张图片，我们可以看到实时的进度；另外我们也给上传按钮绑定了一个 click 事件，上传我们选择的文件，同样也能看到实时进度。
const instance = axios.create()

function calculatePercentage(loaded: number, total: number) {
  return Math.floor(loaded * 1.0) / total
}

function loadProgressBar() {
  const setupStartProgress = () => {
    instance.interceptors.request.use(config => {
      NProgress.start()
      return config
    })
  }

  const setupUpdateProgress = () => {
    const update = (e: ProgressEvent) => {
      console.log(e)
      NProgress.set(calculatePercentage(e.loaded, e.total))
    }
    instance.defaults.onDownloadProgress = update
    instance.defaults.onUploadProgress = update
  }

  const setupStopProgress = () => {
    instance.interceptors.response.use(response => {
      NProgress.done()
      return response
    }, error => {
      NProgress.done()
      return Promise.reject(error)
    })
  }

  setupStartProgress()
  setupUpdateProgress()
  setupStopProgress()
}

loadProgressBar()

const downloadEl = document.getElementById('download')

downloadEl!.addEventListener('click', e => {
  instance.get('https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b605e88d5ef940df9293ab6d73535bc9~tplv-k3u1fbpfcp-zoom-crop-mark:1304:1304:1304:734.awebp?')
})

const uploadEl = document.getElementById('upload')

uploadEl!.addEventListener('click', e => {
  const data = new FormData()
  const fileEl = document.getElementById('file') as HTMLInputElement
  if (fileEl.files) {
    data.append('file', fileEl.files[0])

    instance.post('/more/upload', data)
  }
})


axios.post('/more/post', {
  a: 1
}, {
  auth: {
    username: 'Yee',
    password: '123456'
  }
}).then(res => {
  console.log(res)
})

axios.get('/more/304').then(res => {
  console.log(res)
}).catch((e: AxiosError) => {
  console.log(e.message)
})

axios.get('/more/304', {
  validateStatus(status) {
    return status >= 200 && status < 400
  }
}).then(res => {
  console.log(res)
}).catch((e: AxiosError) => {
  console.log(e.message)
})


// function getA() {
//   return axios.get("/more/A");
// }

// function getB() {
//   return axios.get("/more/B");
// }

// axios.all([getA(), getB()]).then(
//   axios.spread(function(resA, resB) {
//     console.log(resA.data);
//     console.log(resB.data);
//   })
// );

// axios.all([getA(), getB()]).then(([resA, resB]) => {
//   console.log(resA.data);
//   console.log(resB.data);
// });

// const fakeConfig = {
//   baseURL: "https://www.baidu.com/",
//   url: "/user/12345",
//   params: {
//     idClient: 1,
//     idTest: 2,
//     testString: "thisIsATest",
//   },
// };
// console.log(axios.getUri(fakeConfig));
