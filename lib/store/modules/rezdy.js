export default options => ({
  namespaced: true,
  state: () => ({
    options,
    sessions: [],
    loadingSessions: false
  }),
  mutations: {
    setSessionsLoadingState (state, loading) {
      state.loadingSessions = loading
    },
    setSessions (state, sessions) {
      state.sessions = sessions
    }
  },
  actions: {
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
