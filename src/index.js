import { request } from './utils'
import { jp2cn, cn2jp } from './parser/index'

let OPTIONS = {
  cors_proxy: 'https://crossorigin.me/',
  fetch: null
}

try {
  OPTIONS.fetch = window.fetch
} catch (e) {}

let VOID_CALLBACK = function () {}

export default {
  version: '0.0.5',
  set(options) {
    OPTIONS = Object.assign(OPTIONS, options)
  },
  set_cors_proxy(proxy) {
    this.set({ cors_proxy: proxy })
  },
  set_fetch(fetch) {
    this.set({ fetch: fetch })
  },
  jp2cn(query, callback) {
    this.query({
      parser: jp2cn.parser,
      url: jp2cn.url,
      query,
      callback
    })
  },
  cn2jp(query, callback) {
    this.query({
      parser: cn2jp.parser,
      url: cn2jp.url,
      query,
      callback
    })
  },
  query(option) {
    option = Object.assign({}, OPTIONS, option)

    if (!option.fetch)
      throw Error('Missing "fetch" function. ' +
        'If you are using Node.js, you should use "set_fetch" before query.\n' +
        'For more details, please refer to: https://github.com/antfu/hjdict#node')

    let url = option.url(option.query)
    url = encodeURI(url)
    if (option.cors_proxy) {
      if (typeof option.cors_proxy === 'function')
        url = option.cors_proxy(url)
      else
        url = option.cors_proxy + url
    }

    var html = request(option.fetch, url, (data, e) => {
      let returns = {
        query: option.query
      }

      if (e) {
        returns.error = e
      } else {
        returns = Object.assign(returns, option.parser(data))
      }

      (option.callback || VOID_CALLBACK)(returns)
    })
  }
}
