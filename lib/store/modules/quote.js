const QUOTE_DEFAULT = {
  items: []
}

export default () => ({
  namespaced: true,
  state: () => ({
    quote: QUOTE_DEFAULT,
    calculating: false
  }),
  mutations: {
    setCalculating: (state, isCalculating) => {
      state.calculating = isCalculating
    },
    setQuote: (state, quote) => {
      state.quote = quote
    },
    clearQuote: (state) => {
      state.quote.items = []
    }
  },
  actions: {
    getQuote ({ commit }, booking) {
      const quoteBooking = Object.assign({}, booking, {
        items: booking.items.filter(i =>
          i.quantities.some(quantity => quantity.value && quantity.value > 0)
        )
      })

      // filter items without quantities for quote
      if (!quoteBooking.items.length) {
        commit('setQuote', QUOTE_DEFAULT)
        return;
      }
      commit('setCalculating', true)
      this.$axios
        .$post('/api/rezdy/bookings/quote', quoteBooking)
        .then((res) => {
          commit('setQuote', res.booking)
          commit('setCalculating', false)
        })
        .catch((e) => {
          commit('setCalculating', false)
        })
    },
    clearQuote ({ commit }) {
      commit('clearQuote')
    }
  }
})
