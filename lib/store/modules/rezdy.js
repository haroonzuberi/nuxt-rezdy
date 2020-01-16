export default options => ({
  namespaced: true,
  state: () => ({
    options,
    sessions: [],
    products: {},
    loadingSessions: false
  }),
  mutations: {
    updateProducts (state, products) {
      state.products = { ...state.products, ...products }
    },
    setSessionsLoadingState (state, loading) {
      state.loadingSessions = loading
    },
    setSessions (state, sessions) {
      state.sessions = sessions
    }
  },
  actions: {
    async getProducts ({ commit, state }, { productCode }) {
      const response = await Promise.all(
        productCode.map((code) => {
          if (state.products[code]) {
            return Promise.resolve({ product: state.products[code] })
          }
          return this.$axios.$get(`/products/product/${code}`, { params: { rspc: 1 } })
        })
      )
      const products = response.map(res => res.product).reduce((group, product) => {
        group[product.productCode] = product
        return group
      }, {})
      commit('updateProducts', products)
      return products
    },
    async getSessions ({ commit }, params) {
      commit('setSessions', [])
      commit('setSessionsLoadingState', true)
      const fetchSessions = (offset) => {
        return this.$axios
          .$get('/availability', {
            params: { ...params, offset }
          }).then(res => res.sessions)
      }
      const limit = 100
      let offset = 0
      let sessions = await fetchSessions(offset)
      while (sessions.length % limit === 0) {
        offset = offset + limit
        const more = await fetchSessions(offset)
        sessions = [...sessions, ...more]
      }
      commit('setSessions', sessions)
      commit('setSessionsLoadingState', false)
    }
  }
})
