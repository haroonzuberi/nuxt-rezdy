<template>
  <div class="session-list">
    <div v-for="(sessions, date) of sessionsByDate" :key="date" class="session-list-section">
      <slot name="title" v-bind:date="date" v-bind:sessions="sessions">
        {{ date }}
      </slot>
      <div class="session-groups">
        <div
          v-for="(group, productCode) of groupByProductCode(sessions)"
          :key="productCode"
          class="session-group"
          :class="itemClass"
        >
          <div class="session-product-image">
            <figure class="image is-19by9">
              <slot name="image" v-bind:product="products[productCode]" >
                <img :src="products[productCode].images[0].thumbnailUrl" />
              </slot>
            </figure>
          </div>
          <span class="session-product-heading">
            <slot name="product" v-bind:product="products[productCode]" v-bind:sessions="sessions">
              <div class="content">
                <h4>{{ products[productCode].name }}</h4>
              </div>
            </slot>
          </span>

          <span class="session-product-body">
            <slot name="body" v-bind:product="products[productCode]" v-bind:sessions="sessions">
              <div class="content">
                <p>{{ products[productCode].shortDescription }}</p>
              </div>
            </slot>
          </span>
          
          <div class="session-product-footer level">
            <div class="level-left">
              <slot name="footer" v-bind:product="products[productCode]" class="level-item" />
            </div>
            <div class="level-right">
              <ul class="level-item">
                <li v-for="session of group" :key="session.id" class="session-time">
                  <slot name="session" v-bind:session="session" />
                  <b-button type="is-success" size="is-medium" @click="addBookingItem(session)" :disabled="!session.seatsAvailable">
                    {{ session.startTimeLocal | formatSessionTime }}
                  </b-button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sessions-load-more">
      <b-button
        size="is-medium"
        type="is-primary"
        class="is-fullwidth"
        @click="loadMoreSessions"
        v-if="loadMore && sessions.length"
        :disabled="loading"
        :loading="loading"
      >
        {{ loadMoreLabel }}
      </b-button>
    </div>
    <b-loading :active.sync="loading" />
  </div>
</template>

<script>
import { utcToZonedTime } from 'date-fns-tz'
import { format, parseISO, endOfDay, addWeeks,addMinutes } from 'date-fns';
import { createNamespacedHelpers } from 'vuex';
const { mapActions } = createNamespacedHelpers('rezdy/booking')

export default {
  filters: {
    formatSessionTime(value) {
      return format(parseISO(value), 'h:mm a');
      // return value;
    }
  },
  props: {
    loadMore: {
      type: Boolean,
      default: false
    },
    loadMoreLabel: {
      type: String,
      default: 'Load More'
    },
    guests: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 1
    },
    weeks: {
      type: Number,
      default: 6
    },
    productCode: {
      type: Array,
      default: () => []
    },
    itemClass: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      sessions: [],
      products: [],
      offset: 0,
      loading: false
    }
  },
  watch: {
    productCode: {
      async handler(productCode) {
        if(productCode && productCode.length) {
          this.sessions = await this.loadSessions(productCode);
        }
      },
      immediate: true
    }
  },
  computed: {
    endTimeLocal() {
      return format(endOfDay(addWeeks(new Date(), this.weeks)), 'yyyy-MM-dd HH:mm:ss')
    },
    sessionsByDate() {
      return this.sessions.reduce((dates, session) => {
        const date = format(parseISO(session.startTimeLocal), 'yyyy-MM-dd');
        dates[date] = [
          ...(dates[date] ? dates[date] : []),
          session
        ];
        return dates;
      }, {});
    }
  },
  methods: {
    ...mapActions([
      'addItem'
    ]),
    async loadMoreSessions() {
      this.offset = this.offset + this.limit;
      const sessions = await this.loadSessions(this.productCode)
      this.sessions = [...this.sessions, ...sessions]
    },
    async loadSessions(productCode) {
      this.loading = true
      const { sessions } = await this.$rezdy.getSessions({
        productCode,
        endTimeLocal: this.endTimeLocal,
        limit: this.limit,
        offset: this.offset
      })
      
      const { products } = await this.$rezdy.getProducts({productCode})
      this.products = products

      this.loading = false
      return sessions.filter(session => {
        if(!session.seats) return;
        const nowPlusNoticeTz = utcToZonedTime(
          addMinutes(new Date(), this.products[session.productCode].minimumNoticeMinutes),
          this.products[session.productCode].timezone
        )
        return parseISO(session.startTime) > nowPlusNoticeTz
      })
    },
    groupByProductCode(sessions) {
      return sessions.reduce((group, session) => {
        group[session.productCode] = [
          ...(group[session.productCode] || []),
          session
        ];
        return group;
      }, {});
      return null
    },
    addBookingItem(session) {
      this.$rezdy.checkoutSession(session, this)
    }
  }
};
</script>

<style scoped>
.session-list-section:not(:first-child) {
  margin-top: 2rem;
}
.session-group {
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  grid-template-rows: auto;
  grid-template-columns: 150px auto;
  grid-template-areas:
    'image heading'
    'image body'
    'image footer';
}
.session-product-image {
  grid-area: image;
}
.session-product-heading {
  grid-area: heading;
  display: flex;
  align-items: center;
}
.session-product-body {
  grid-area: body;
}
.session-product-footer {
  grid-area: footer;
}

.session-time {
  padding: 4px;
}
.sessions-load-more {
  margin-top: 2rem;
}

@media only screen and (max-width: 600px) {
  .session-group {
    display: grid;
    grid-gap: 10px;
    grid-template-rows: auto;
    grid-template-columns: auto;
    grid-template-areas:
      'image heading'
      'body body'
      'footer footer';
  }
  .session-product-footer .level-item {
    flex-wrap: wrap;
  }
}
</style>
