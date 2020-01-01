// https://developers.rezdy.com/rezdy-api/resources/booking?v=latest
import { uniq } from 'lodash'

const initialState = () => ({
  booking: {
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
    vouchers: []
  },
  quote: {}
})

function isSameSession (s1, s2) {
  return (
    s1.productCode === s2.productCode && (
      s1.startTimeLocal === s2.startTimeLocal ||
      (!s1.startTimeLocal || !s2.startTimeLocal)
    )
  )
}

export default options => ({
  namespaced: true,
  state: () => ({
    loading: {},
    options,
    ...initialState()
  }),
  mutations: {
    setCustomer: (state, customer) => {
      state.booking.customer = customer
    },
    addItem: (state, { item, product }) => {
      const idx = state.booking.items.findIndex(i => isSameSession(i, item))

      // Replace item if it already exists
      if (idx > -1) {
        state.booking.items = [
          ...state.booking.items.slice(0, idx),
          item,
          ...state.booking.items.slice(idx + 1)
        ]
        return
      }
      state.booking.items = [...state.booking.items, item]
    },
    removeItem: (state, item) => {
      state.booking.items = [...state.booking.items.filter(i => !isSameSession(i, item))]
    },
    updateItem: (state, item) => {
      // TODO: should update and add be same mutation?
      const idx = state.booking.items.findIndex(i => isSameSession(i, item))
      state.booking.items = [
        ...state.booking.items.slice(0, idx),
        item,
        ...state.booking.items.slice(idx + 1)
      ]
    },
    /* updateItemQuantities: (state, { item, quantities }) => {
      const itemIdx = state.booking.items.findIndex(i => isSameSession(i, item))

      // get seats
      const itemProduct = state.booking.products.find(
        p => p.productCode === state.booking.items[itemIdx].productCode
      )
      const seats = quantities.reduce((acc, q) => {
        const val =
              itemProduct.priceOptions.find(o => o.label === q.optionLabel)
                .seatsUsed * q.value
        return acc + val
      }, 0)

      const itemUpdate = Object.assign({}, item, {
        quantities,
        participants: state.booking.items[itemIdx].participants
          ? state.booking.items[itemIdx].participants.slice(0, seats)
          : null
      })

      state.booking.items = [
        ...state.booking.items.slice(0, itemIdx),
        itemUpdate,
        ...state.booking.items.slice(itemIdx + 1)
      ]
    }, */
    updateItemExtras: (state, { item, extras }) => {
      const itemIdx = state.booking.items.findIndex(i => isSameSession(i, item))

      const itemUpdate = Object.assign({}, item, { extras })

      state.booking.items = [
        ...state.booking.items.slice(0, itemIdx),
        itemUpdate,
        ...state.booking.items.slice(itemIdx + 1)
      ]
    },
    updateItemPickupLocation: (state, { item, pickupLocation }) => {
      const itemIdx = state.booking.items.findIndex(i => isSameSession(i, item))

      const itemUpdate = Object.assign({}, item, { pickupLocation })

      state.booking.items = [
        ...state.booking.items.slice(0, itemIdx),
        itemUpdate,
        ...state.booking.items.slice(itemIdx + 1)
      ]
    },
    updateItemParticipantField: (state, { item, index, field }) => {
      const itemIdx = state.booking.items.findIndex(i => isSameSession(i, item))
      const bookingItem = state.booking.items[itemIdx]
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

      state.booking.items = [
        ...state.booking.items.slice(0, itemIdx),
        itemUpdate,
        ...state.booking.items.slice(itemIdx + 1)
      ]
    },
    setFields: (state, fields) => {
      state.booking.fields = fields
    },
    addVoucher: (state, code) => {
      state.booking.vouchers = uniq([...state.booking.vouchers, code])
    },
    removeVoucher: (state, code) => {
      state.booking.vouchers = state.booking.vouchers.filter(v => v !== code)
    },
    clearBooking: (state) => {
      // acquire initial state
      const s = initialState()
      Object.keys(s).forEach((key) => {
        state[key] = s[key]
      })
    },
    setQuote: (state, quote) => {
      state.quote = quote
    },
    setLoadingState: (state, { prop, loading }) => {
      state.loading = {
        ...state.loading,
        [prop]: loading
      }
    }
  },
  actions: {
    setCustomer ({ commit }, customer) {
      commit('setCustomer', customer)
    },
    addItem ({ commit, dispatch }, payload) {
      // item and product
      // TODO: handle vouchers
      commit('addItem', payload)
      dispatch('updateBookingQuote')
    },
    removeItem ({ commit, dispatch }, { item }) {
      commit('removeItem', item)
      dispatch('updateBookingQuote')
    },
    updateItem ({ commit, dispatch }, item) {
      commit('updateItem', item)
      dispatch('updateBookingQuote')
    },
    setFields ({ commit }, fields) {
      commit('setFields', fields)
    },
    updateItemQuantities ({ commit, dispatch }, payload) {
      commit('updateItemQuantities', payload)
      dispatch('updateBookingQuote')
    },
    updateItemExtras ({ commit, dispatch }, payload) {
      commit('updateItemExtras', payload)
      dispatch('updateBookingQuote')
    },
    updateItemParticipantField ({ commit }, payload) {
      commit('updateItemParticipantField', payload)
    },
    updateItemPickupLocation ({ commit }, payload) {
      commit('updateItemPickupLocation', payload)
    },
    addVoucher ({ commit, dispatch }, code) {
      commit('addVoucher', code)
      dispatch('updateBookingQuote')
    },
    removeVoucher ({ commit, dispatch }, code) {
      commit('removeVoucher', code)
      dispatch('updateBookingQuote')
    },
    clearBooking ({ commit, dispatch }) {
      commit('clearBooking')
      dispatch('updateBookingQuote')
    },
    async updateBookingQuote ({ commit, state }) {
      if (!state.booking.items.length) {
        const empty = {
          items: [],
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0
        }
        commit('setQuote', empty)
        return empty
      }
      const { baseURL, token } = state.options
      this.$axios.setBaseURL(baseURL)
      this.$axios.setToken(token, 'Bearer')
      commit('setLoadingState', { prop: 'quote', loading: true })
      const { booking } = await this.$axios.$post('/bookings/quote', state.booking)
      commit('setLoadingState', { prop: 'quote', loading: false })
      commit('setQuote', booking)
      return booking
    }
  }
})
