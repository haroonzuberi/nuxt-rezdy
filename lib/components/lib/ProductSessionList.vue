<template>
  <div class="session-list-compact">
    <div v-for="(sessions, date) of sessionsByDate" :key="date">
      <slot name="title" v-bind:date="date" v-bind:sessions="sessions">
        {{ date }}
      </slot>
      <div class="session-groups">
        <div
          v-for="(group, productCode) of groupByProductCode(sessions)"
          :key="productCode"
          class="session-group"
        >
          <span class="session-product-name">
            <slot name="product" v-bind:productCode="productCode" v-bind:sessions="sessions">
              {{ productCode }}
            </slot>
          </span>
          <ul class="session-time-slots">
            <li v-for="session of group" :key="session.id" class="session-time">
              <slot name="session" v-bind:session="session" />
              <b-button type="is-success" @click="addBookingItem(session)" :disabled="!session.seatsAvailable">
                {{ session.startTimeLocal | formatSessionTime }}
              </b-button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <b-button @click="loadMoreSessions" v-if="loadMore && sessions.length" :disabled="loading" :loading="loading">
      {{ loadMoreLabel }}
    </b-button>
    <b-loading :active.sync="loading" />
  </div>
</template>

<script>
import { format, parseISO, endOfDay, addWeeks } from 'date-fns';
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
    }
  },
  data() {
    return {
      sessions: [],
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
      this.loading = false
      return sessions
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
      const details = this.guests.map(g => {
        const [label, value] = Array.isArray(g) ? g : g.split(',');
        if (label) {
          return Object.assign(
            {},
            { value },
            session.priceOptions.find(o => o.label === label)
          );
        }

        return Object.assign(
          {},
          { value },
          session.priceOptions
            .filter(o => o.priceGroupType === label)
            .find(o => value <= o.maxQuantity && value >= o.minQuantity)
        );
      });
      const item = {
        productCode: session.productCode,
        startTimeLocal: session.startTimeLocal,
        endTimeLocal: session.endTimeLocal,
        quantities: details.map(q => ({
          value: q.value,
          optionLabel: q.label,
          optionPrice: q.price,
          optionId: q.id
        }))
      };
      this.addItem(item)
      // this.$router.push('/checkout');
    }
  }
};
</script>

<style></style>
