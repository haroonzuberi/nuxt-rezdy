import axios from 'axios'
import * as helpers from './helpers/index.js'

const options = JSON.parse(`<%= JSON.stringify(options) %>`)
const { namespace, baseURL, token } = options
const $axios = axios.create({baseURL})
$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
$axios.$get = (endpoint, options) => $axios.get(endpoint, options).then(res => res.data)


export default (ctx, inject) => {

  const { state } = ctx.store
  const { app } = ctx

  const plugin = {
    checkoutProduct(productCode, parent) {
      return helpers.checkoutProduct.call(parent, { namespace, state, app, productCode})
    },
    getSessions(params) {
      return helpers.getSessions({ $axios, params })
    },
    getProducts(params) {
      return helpers.getProducts({ $axios, params })
    },
    message(string) {
      return helpers.message({ namespace, string })
    }
  }

  inject(namespace, plugin)
  ctx.$rezdy = plugin
  
}