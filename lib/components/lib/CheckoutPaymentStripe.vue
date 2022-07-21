<template>
  <form @submit.prevent="handleSubmit" id="rezdy--payment-form">
    <div class="rezdy--payment-accepted-cards is-pulled-right has-text-grey">
      <fa-icon
        class="accepted-card"
        v-for="card of acceptedCards"
        :key="card"
        :icon="['fab', 'cc-' + card]"
        size="lg"
      />
    </div>
    <b-field :label="$t('credit-debit')" label-for="card-element">
      <div class="control">
        <div id="card-element" class="input" :class="cardClass">
          {{ $t('loading') }}...
        </div>
      </div>
    </b-field>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          {{ $t('pay-securely-with') }} &nbsp;
          <a href="https://stripe.com/" target="_blank">
            <fa-icon
              :icon="['fab', 'stripe']"
              size="4x"
              title="Stripe Payments"
            />
          </a>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <b-button
            native-type="submit"
            type="is-success"
            size="is-medium"
            :disabled="!canPay || !valid || processing"
            icon-left="lock"
          >
            {{ $t('pay', { amount: totalDue }) }}
          </b-button>
        </div>
      </div>
    </div>
    <b-loading :active="processing" :is-full-page="false" />
  </form>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('rezdy/booking')

export default {
  name: 'CheckoutPaymentStripe',
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
      stripe: null,
      elements: null,
      card: null,
      cardClass: '',
      valid: false,
      processing: false,
      acceptedCards: [
        'visa',
        'amex',
        'discover',
        'jcb',
        'mastercard',
        'diners-club'
      ]
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
    if (window.Stripe) {
      this.buildForm()
    } else {
      const script = document.createElement('script')
      script.onload = this.buildForm
      script.type = 'text/javascript'
      script.src = 'https://js.stripe.com/v3/'
      document.head.appendChild(script)
    }
  },
  methods: {
    handleError(error) {
      const { message } = error
      this.$buefy.toast.open({
        message,
        type: 'is-danger'
      })
    },
    buildForm() {
      const { publishableKey, fonts, style } = this.$rezdy.stripe
      this.stripe = Stripe(publishableKey, { locale: this.$i18n.locale })
      this.elements = this.stripe.elements({ fonts })
      this.card = this.elements.create('card', { style })
      this.card.mount('#card-element')
      this.card.on('focus', () => (this.cardClass = 'is-active'))
      this.card.on('blur', () => (this.cardClass = ''))
      this.card.on('change', event => {
        if (event.complete) {
          this.valid = true
        } else if (event.error) {
          this.valid = false
        }
      })
    },
    async handleSubmit() {
      if (!this.canPay || !this.valid) return
      this.processing = true
      const { token, error } = await this.stripe.createToken(this.card)

      if (error) {
        this.handleError({ message: error.message })
        return
      }

      const order = await this.$rezdy.placeOrder({
        ...this.booking,
        fields: this.fields,
        creditCard: {
          cardToken: token.id
        }
      })

      const { booking } = order

      this.processing = false

      if (order.error) {
        this.handleError({ message: order.error.split(';')[0] })
        return
      }

      this.$emit('confirmation', { booking })
      this.$ecommerce.trackPurchase({ booking })
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
