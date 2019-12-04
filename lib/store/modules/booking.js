// https://developers.rezdy.com/rezdy-api/resources/booking?v=latest
import { uniq } from 'lodash'

const initialState = () => ({
  comments: null,
  commission: null,
  coupon: null,
  createdBy: {},
  creditCard: {},
  customer: {},
  dateConfirmed: null,
  dateCreated: null,
  datePaid: null,
  dateUpdated: null,
  fields: [],
  internalNotes: null,
  items: [],
  orderNumber: null,
  paymentOption: null,
  payments: [],
  resellerAlias: null,
  resellerComments: null,
  resellerId: null,
  resellerName: null,
  resellerReference: null,
  resellerSource: null,
  resellerUser: {},
  sendNotifications: false,
  source: null,
  sourceChannel: null,
  sourceReferrer: null,
  status: null,
  supplierAlias: null,
  supplierId: null,
  supplierName: null,
  surcharge: null,
  totalAmount: null,
  totalCurrency: null,
  totalDue: null,
  totalPaid: null,
  vouchers: [],
  products: [] // This is 'custom'
})

function isSameSession (s1, s2) {
  return (
    s1.productCode === s2.productCode && s1.startTimeLocal === s2.startTimeLocal
  )
}

export default () => ({
  state: () => ({
    ...initialState()
  }),
  mutations: {
    setCustomer: (state, customer) => {
      state.customer = customer
    },
    addItem: (state, { item, product }) => {
      // Don't add product unless its missing (yes order matters here)
      if (!state.items.find(i => i.productCode === item.productCode)) {
        state.products = [...state.products, product]
      }

      const idx = state.items.findIndex(i => isSameSession(i, item))

      // Replace item if it already exists
      if (idx > -1) {
        state.items = [
          ...state.items.slice(0, idx),
          item,
          ...state.items.slice(idx + 1)
        ]
        return
      }
      state.items = [...state.items, item]
    },
    removeItem: (state, item) => {
      state.items = [...state.items.filter(i => !isSameSession(i, item))]

      // Ignore product removal if other items require product
      if (state.items.find(i => i.productCode === item.productCode)) { return }
      state.products = [
        ...state.products.filter(p => p.productCode !== item.productCode)
      ]
    },
    updateItem: (state, item) => {
      // TODO: should update and add be same mutation?
      const idx = state.items.findIndex(i => isSameSession(i, item))
      state.items = [
        ...state.items.slice(0, idx),
        item,
        ...state.items.slice(idx + 1)
      ]
    },
    updateItemQuantities: (state, { item, quantities }) => {
      const itemIdx = state.items.findIndex(i => isSameSession(i, item))

      // get seats
      const itemProduct = state.products.find(
        p => p.productCode === state.items[itemIdx].productCode
      )
      const seats = quantities.reduce((acc, q) => {
        const val =
              itemProduct.priceOptions.find(o => o.label === q.optionLabel)
                .seatsUsed * q.value
        return acc + val
      }, 0)

      const itemUpdate = Object.assign({}, item, {
        quantities,
        participants: state.items[itemIdx].participants
          ? state.items[itemIdx].participants.slice(0, seats)
          : null
      })

      state.items = [
        ...state.items.slice(0, itemIdx),
        itemUpdate,
        ...state.items.slice(itemIdx + 1)
      ]
    },
    updateItemExtras: (state, { item, extras }) => {
      const itemIdx = state.items.findIndex(i => isSameSession(i, item))

      const itemUpdate = Object.assign({}, item, { extras })

      state.items = [
        ...state.items.slice(0, itemIdx),
        itemUpdate,
        ...state.items.slice(itemIdx + 1)
      ]
    },
    updateItemPickupLocation: (state, { item, pickupLocation }) => {
      const itemIdx = state.items.findIndex(i => isSameSession(i, item))

      const itemUpdate = Object.assign({}, item, { pickupLocation })

      state.items = [
        ...state.items.slice(0, itemIdx),
        itemUpdate,
        ...state.items.slice(itemIdx + 1)
      ]
    },
    updateItemParticipantField: (state, { item, index, field }) => {
      const itemIdx = state.items.findIndex(i => isSameSession(i, item))
      const bookingItem = state.items[itemIdx]
      const participant =
            bookingItem.participants &&
            typeof bookingItem.participants[index] !== 'undefined'
              ? bookingItem.participants[index]
              : { fields: [] }

      const fieldIdx = participant.fields.findIndex(p => p.label === field.label)

      const participantFields =
            fieldIdx > -1
              ? [
                ...participant.fields.slice(0, fieldIdx),
                field,
                ...participant.fields.slice(fieldIdx + 1)
              ]
              : [...participant.fields, field]

      const itemUpdate = Object.assign({}, item, {
        participants: [
          ...(bookingItem.participants
            ? bookingItem.participants.slice(0, index)
            : []),
          { fields: participantFields },
          ...(bookingItem.participants
            ? bookingItem.participants.slice(index + 1)
            : [])
        ]
      })

      state.items = [
        ...state.items.slice(0, itemIdx),
        itemUpdate,
        ...state.items.slice(itemIdx + 1)
      ]
    },
    setFields: (state, fields) => {
      state.fields = fields
    },
    addVoucher: (state, code) => {
      state.vouchers = uniq([...state.vouchers, code])
    },
    removeVoucher: (state, code) => {
      state.vouchers = state.vouchers.filter(v => v !== code)
    },
    clearBooking: (state) => {
      // acquire initial state
      const s = initialState()
      Object.keys(s).forEach((key) => {
        state[key] = s[key]
      })
    }
  },
  actions: {
    setCustomer ({ commit }, customer) {
      commit('setCustomer', customer)
    },
    async addItem ({ commit }, item) {
      const product = await this.$axios
        .$get(`/api/rezdy/products/${item.productCode}`)
        .then(res => res.product)
      commit('addItem', { item, product })
      this.$ecommerce.trackCheckoutAdd({ item })
    },
    removeItem ({ commit }, { item }) {
      this.$ecommerce.trackCheckoutRemove({ item })
      commit('removeItem', item)
    },
    updateItem ({ commit }, item) {
      commit('updateItem', item)
    },
    setFields ({ commit }, fields) {
      commit('setFields', fields)
    },
    updateItemQuantities ({ commit }, payload) {
      commit('updateItemQuantities', payload)
    },
    updateItemExtras ({ commit }, payload) {
      commit('updateItemExtras', payload)
    },
    updateItemParticipantField ({ commit }, payload) {
      commit('updateItemParticipantField', payload)
    },
    updateItemPickupLocation ({ commit }, payload) {
      commit('updateItemPickupLocation', payload)
    },
    addVoucher ({ commit }, code) {
      commit('addVoucher', code)
    },
    removeVoucher ({ commit }, code) {
      commit('removeVoucher', code)
    },
    clearBooking ({ commit }) {
      commit('clearBooking')
    }
  }
})
