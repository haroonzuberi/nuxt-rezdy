import axios from 'axios'
import * as helpers from './helpers/index.js'
import countries from './helpers/countries.json'
import standardFields from './helpers/rezdy-fields.json'

const options = JSON.parse(`<%= JSON.stringify(options) %>`)
const { namespace, baseURL, token } = options
const $axios = axios.create({baseURL})
$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
$axios.$get = (endpoint, options) => $axios.get(endpoint, options).then(res => res.data)


export default (ctx, inject) => {

  const { state } = ctx.store

  const plugin = {
    countries,
    standardFields,
    checkoutProduct(productCode, parent) {
      return helpers.checkoutProduct.call(parent, { namespace, state, productCode})
    },
    checkoutSession(session, parent) {
      const { productCode } = session
      return helpers.checkoutProduct.call(parent, { namespace, state, productCode, session})
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