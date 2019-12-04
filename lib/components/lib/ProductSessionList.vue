<template>
  <div class="session-list-compact">
    <h3 class="sessions-title">
      {{ title }}
    </h3>
    <div class="session-groups">
      <div
        v-for="(group, productCode) of sessionsGrouped"
        :key="productCode"
        class="session-group"
      >
        <span class="session-product-category">{{ group[0].product.categories[0].name }}</span>
        <span class="session-product-name">
          <nuxt-link class="session-product-link" :to="'/tours/'+group[0].product.slug">{{ group[0].product.name }}</nuxt-link>
          <span v-if="group[0].product.discountAmount" class="session-price">
            <span class="has-text-danger">
              {{ group[0].product.discountMessage }}
            </span>
            <del>{{ group[0].product.rezdyProduct.advertisedPrice + group[0].product.discountAmount | price }}</del>
            {{ group[0].product.rezdyProduct.advertisedPrice | price }}
          </span>
          <small v-else class="session-price">{{ group[0].product.rezdyProduct.advertisedPrice | price }}</small>
        </span>
        <ul class="session-time-slots">
          <li v-for="session of group" :key="session.id" class="session-time">
            <b-button color="success" @click="addBookingItem(session)">
              {{ session.startTime | formatSessionTime }}
            </b-button>
            <div v-if="session.seatsAvailable < 6" class="session-availability" @click="addBookingItem()">
              <!-- <fa :icon="['fas', session.product.transportation]" size="lg" /> -->
              Only {{ session.seatsAvailable }} spot{{ session.seatsAvailable > 1 ? 's' : '' }} left!
            </div>
          </li>
        </ul>
        <!-- <ProductSessionCard :session="session" :guests="guests" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { format, parse } from 'date-fns';
export default {
  filters: {
    formatSessionTime(value) {
      return format(parse(value), 'h:mm A');
    }
  },
  props: {
    sessions: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    guests: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    sessionsGrouped() {
      return this.sessions.reduce((group, session) => {
        group[session.productCode] = [
          ...(group[session.productCode] || []),
          session
        ];
        return group;
      }, {});
    }
  },
  methods: {
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
      this.$store.dispatch('booking/addItem', item);
      this.$router.push('/checkout');
    }
  }
};
</script>

<style></style>
