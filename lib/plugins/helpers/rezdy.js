import { format, startOfDay, addMonths } from 'date-fns';
import { ModalProgrammatic as Modal } from 'buefy'
import BookingFlow from '../../components/lib/BookingFlow.vue'

const storeModuleExists = ({ state, namespace }) => {
  if (!state || !state[namespace]) {
    console.error(`${namespace} nuxt module error: store not initialized`)
    return false
  } else {
    return true
  }
}

export function checkoutProduct({ productCode, session }) {
  Modal.open({
    component: BookingFlow,
    canCancel: false,
    parent: this,
    props: {
      productCode,
      session
    }
  })
}

export const getProducts = async ({ $axios, params }) => {
  const { productCode } = params
  const response = await Promise.all(
    productCode.map(code => $axios.$get(`/products/product/${code}`, { params: {rspc: 1} }))
  )

  const products = response.map(res => res.product)

  return {products}
}
  
export const getSessions = async ({ $axios, params }) => {
  const options = {
    startTimeLocal: format(startOfDay(new Date()), 'yyyy-MM-dd HH:mm:ss'),
    endTimeLocal: format(startOfDay(addMonths(new Date(), 6)), 'yyyy-MM-dd HH:mm:ss'),
    ...params
  }

  const fetchSessions = (offset) => {
    return $axios.$get('/availability', { params: { ...options, offset } })
  }
  const limit = params.limit || 100
  let offset = params.offset || 0
  let sessions = await fetchSessions(offset)
  while (sessions.length % limit === 0) {
    offset = offset + limit
    const more = await fetchSessions(offset)
    sessions = [...sessions, ...more]
  }
  return sessions
}
