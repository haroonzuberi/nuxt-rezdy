<template>
  <form @submit.prevent="handleSubmit" id="rezdy--payment-form">
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          {{ $t('pay-securely-with') }} &nbsp;
          <a href="https://vinti4.cv/" target="_blank">
            <fa-icon
              :icon="['fab', 'vinti4']"
              size="lg"
              title="Vinti4 Network"
            />
          </a>
          <fa-icon
            class="accepted-card"
            v-for="card of acceptedCards"
            :key="card"
            :icon="['fab', 'cc-' + card]"
            size="3x"
          />
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <b-button
            native-type="submit"
            type="is-success"
            size="is-medium"
            :disabled="!canPay"
            icon-left="lock"
          >
            {{ $t('pay', { amount: totalDue }) }}
          </b-button>
        </div>
      </div>
    </div>
    <div class="content">
      <p class="has-text-centered is-size-7">
        {{ $t('popup-notice') }}
      </p>
    </div>
    <b-loading :active="processing" :is-full-page="false" :can-cancel="false" />
  </form>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { stringify as qs } from 'querystring';
import { format } from 'date-fns'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('rezdy/booking')

export default {
  name: 'CheckoutPaymentVinti4',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    canPay: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      processing: false,
      acceptedCards: ['visa'],
      iframeSrc: null,
      messageListener: null,
      completedBooking: null,
      paymentWindow: null
    }
  },
  watch: {
    processing(status) {
      this.$emit('processing', status)
    }
  },
  computed: {
    ...mapState({
      booking: state => state.booking,
      quote: state => state.quote,
      totalDue(state) {
        const { totalDue, totalCurrency } = state.quote
        return this.$options.filters.currency(
          totalDue,
          this.$i18n.locale,
          totalCurrency
        )
      }
    })
  },
  mounted() {
    window.addEventListener('message', this.receiveMessage, false)
  },
  beforeDestroy() {
    window.removeEventListener('message', this.receiveMessage, false)
  },
  methods: {
    handleError(error) {
      const { message } = error
      this.$buefy.toast.open({
        message,
        type: 'is-danger'
      })
    },
    receiveMessage(message) {
      if (!message || !message.data) return
      this.paymentWindow.close()
      const { status, code } = JSON.parse(message.data)
      if (status === 'success') {
        this.handlePaymentSuccess(code)
      }
      if (status === 'error') {
        this.handlePaymentFailure(code)
      }
    },
    async handlePaymentSuccess(code) {
      const { booking } = await this.$rezdy.updateBookingStatus(
        code,
        this.completedBooking,
        'CONFIRMED'
      )
      this.processing = false

      this.$emit('confirmation', { booking })
      this.$ecommerce.trackPurchase({ booking })
    },
    async handlePaymentFailure(code) {
      await this.$rezdy.cancelBooking(this.completedBooking.orderNumber)
      this.handleError({
        message: 'There was an error processing your request.'
      })
      this.processing = false
    },
    async handleSubmit() {
      if (!this.canPay) return
      this.processing = true

      const { totalDue, totalCurrency } = this.quote

      const order = await this.$rezdy.placeOrder({
        ...this.booking,
        fields: this.fields,
        status: 'PROCESSING',
        payments: [
          {
            type: 'CREDITCARD',
            amount: totalDue,
            currency: totalCurrency,
            label: 'Payment processed by vinti4'
          }
        ]
      })

      if (order.error) {
        this.processing = false
        this.handleError({ message: order.error.split(';')[0] })
        return
      }

      this.completedBooking = order.booking

      // get fingerprint
      const merchantRef = this.completedBooking.orderNumber
      const merchantSession = 'S' + 1000 + Math.floor(Math.random() * 1000)
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      const amount = Math.round(totalDue)
      const fingerPrint = await this.$axios.$get(`vinti4/fingerprint`, {
        params: {
          timestamp,
          amount,
          merchantRef,
          merchantSession
        }
      })

      const { baseURL, token } = this.$store.state.rezdy.options
      const query = qs({
        token,
        amount,
        urlMerchantResponse: this.$rezdy.vinti4.urlMerchantResponse,
        fingerPrint: encodeURIComponent(fingerPrint),
        merchantRef,
        merchantSession,
        timestamp
      })

      this.paymentWindow = window.open(
        `${baseURL}vinti4/payment?${query}`,
        'Vinti4 Payment',
        'width=420,height=795,location=no,toolbar=no,menubar=no,status=no,titlebar=no'
      )
    }
  }
}
</script>

<style scoped>
#card-element {
  display: block;
}

@media only screen and (max-width: 600px) {
  .rezdy--payment-accepted-cards {
    float: none !important;
    text-align: center;
    margin-bottom: 1rem;
  }
}
.accepted-card {
  margin: 0 0.25em;
}
</style>
