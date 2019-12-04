export default options => ({
  state: () => ({
    options,
    sessions: []
  }),
  mutations: {},
  actions: {
    getSessions({ commit }, { products, search }) {
      const productQuery = products
        .filter(p => {
          if (search) {
            const s = search.toLowerCase();
            return p.name.toLowerCase().indexOf(s) > -1;
          }
          return true
        })
        .map(p => `productCode=${p}`)
        .join('&');

      if (!productQuery) return [];

      const fetchSessions = offset => {
        const params = querystring.stringify(
          Object.assign({}, this.queryFilters, { offset })
        );
        return this.$axios
          .get(`/api/rezdy/availability?${productSearch}&${params}`)
          .then(res =>
            res.data.sessions
              .map(s =>
                Object.assign(s, {
                  product: this.products.find(p => p.rezdyId === s.productCode)
                })
              )
              .filter(
                s =>
                  parse(s.startTime) >
                  addMinutes(
                    new Date(),
                    s.product.rezdyProduct.minimumNoticeMinutes
                  )
              )
          );
      };

      const limit = 100;
      let offset = 0;
      let sessions = await fetchSessions(offset);
      while (sessions.length % limit === 0) {
        offset = offset + limit;
        const more = await fetchSessions(offset);
        sessions = [...sessions, ...more];
      }
      return sessions;
    }
  }
})
