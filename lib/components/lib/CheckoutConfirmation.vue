<template>
  <div v-if="booking" class="section is-large rezdy--checkout-confirmation">
    <h1 class="title">{{ $t('thank-you-order') }}</h1>
    <p class="subtitle is-5">
      {{ $t('thank-you-order-no') }}
      {{ booking.orderNumber }}
    </p>
    <p class="content has-text-centered is-medium">
      {{ $t(booking.status) }}
    </p>
    <p class="content has-text-centered" v-if="company && company.phone">
      {{ $t('booking-message') }}
      {{ company.phone }}
    </p>
    <checkout-order-summary :booking="booking" is-confirmation />
    <div class="confirmation-actions">
      <b-button
        type="is-dark"
        outlined
        size="is-medium"
        @click="printConfirmation"
      >
        {{ $t('print') }}
      </b-button>
      <b-button type="is-success" size="is-medium" @click="$parent.close()">
        {{ $t('done') }}
      </b-button>
    </div>
  </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { createNamespacedHelpers } from 'vuex'
import CheckoutOrderSummary from './CheckoutOrderSummary.vue'
const { mapState } = createNamespacedHelpers('rezdy')
export default {
  name: 'CheckoutConfirmation',
  components: {
    CheckoutOrderSummary
  },
  props: {
    booking: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      company: null
    }
  },
  computed: {
    ...mapState({
      companyAlias: state => state.options.companyAlias
    })
  },
  async mounted() {
    const { company } = await this.$rezdy.getCompany(this.companyAlias)
    this.company = company
  },
  methods: {
    printConfirmation() {
      if (typeof window !== 'undefined') window.print()
    }
  }
}
</script>

<style>
@media print {
  #__nuxt {
    display: none;
  }
  .rezdy--checkout-confirmation .confirmation-actions {
    display: none !important;
  }
}
.rezdy--checkout-confirmation .confirmation-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.rezdy--checkout-confirmation .confirmation-actions > .button {
  margin: 4px;
}
</style>
