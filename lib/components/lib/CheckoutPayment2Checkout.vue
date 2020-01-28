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
          2pay.js checkout card element will load here:
          {{ $t('loading') }}...
        </div>
      </div>
    </b-field>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          {{ $t('pay-securely-with') }} &nbsp;
          <a href="https://2checkout.com/" target="_blank">
            <fa-icon :icon="['fab', '2checkout']" title="2Checkout Payments" />
          </a>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <b-button
            native-type="submit"
            type="is-success"
            size="is-medium"
            :disabled="!canPay || !valid"
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
const { mapState } = createNamespacedHelpers('rezdy')

export default {
  name: 'CheckoutPayment2Checkout',
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
      client: null,
      elements: null,
      card: null,
      cardClass: '',
      valid: true,
      // valid: false,
      processing: false,
      acceptedCards: ['visa', 'amex', 'discover', 'jcb', 'mastercard']
    }
  },
  watch: {
    processing(status) {
      this.$emit('processing', status)
    }
  },
  computed: {
    ...mapState({
      booking: state => state.booking.booking,
      quote: state => state.booking.quote,
      rezdyOptions: state => state.options,
      totalDue(state) {
        const { totalDue, totalCurrency } = state.booking.quote
        return this.$options.filters.currency(
          totalDue,
          this.$i18n.locale,
          totalCurrency
        )
      }
    })
  },
  mounted() {
    if (window.TwoPayClient) {
      this.buildForm()
    } else {
      const script = document.createElement('script')
      script.onload = this.buildForm
      script.type = 'text/javascript'
      script.src = 'https://js.2pay.2checkout.com/v1/'
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
      // const { publishableKey, fonts, style } = this.$rezdy.twocheckout
      this.client = new TwoPayClient('RDGM')
      this.card = this.client.components.create('card')
      this.card.mount('#card-element')
      this.card.on('focus', () => (this.cardClass = 'is-active'))
      this.card.on('blur', () => (this.cardClass = ''))
      /* this.card.on('change', event => {
        if (event.complete) {
          this.valid = true
        } else if (event.error) {
          this.valid = false
        }
      }) */
    },
    async handleSubmit() {
      if (!this.canPay || !this.valid) return

      const { totalDue, totalCurrency } = this.quote
      const { ip, country } = await this.$axios.$get('https://ipinfo.io/json')
      // get required details for 2pay
      const {
        Email,
        FirstName,
        LastName,
        City,
        State,
        CountryCode,
        Address1,
        Zip
      } = this.fields.reduce((obj, field) => {
        switch (field.label) {
          case 'Email':
            return { ...obj, Email: field.value }
          case 'First Name':
            return { ...obj, FirstName: field.value }
          case 'Last Name':
            return { ...obj, LastName: field.value }
          case 'Country':
            return { ...obj, CountryCode: field.value }
          case 'City':
            return { ...obj, City: field.value }
          case 'State/County/Region':
            return { ...obj, State: field.value }
          case 'Address':
            return { ...obj, Address1: field.value }
          case 'Postcode/ZIP':
            return { ...obj, Zip: field.value }
        }
        return obj
      }, {})

      console.log(this.fields)

      /* 
      TODO: Waiting on 2pay.js
        this.processing = true
        const { token, error } = await this.client.tokens.generate(this.card, {
          name: 'Test Person'
        })

        if (error) {
          this.handleError({ message: error.message })
          return
        }

        console.log(token)
      */

      // https://knowledgecenter.2checkout.com/API-Integration/REST_5.0_Reference#/reference/orders-with-dynamic-products

      const checkoutDetails = {
        Currency: totalCurrency,
        Language: this.$i18n.locale,
        Country: country,
        CustomerIP: ip,
        // ExternalReference: ...Optional
        Source: window.location.hostname,
        Items: [
          {
            Code: null, // Should be sent as null.  any other value will be ignored
            Quantity: 1,
            IsDynamic: true,
            Tangible: false,
            PurchaseType: 'PRODUCT',
            Price: {
              Amount: totalDue,
              Type: 'CUSTOM'
            },
            Name: 'Test name'
          }
        ],
        BillingDetails: {
          // TODO: seee what we can leave out/in
          CountryCode,
          FirstName,
          LastName,
          Email,
          Address1,
          City,
          State,
          Zip
        },
        PaymentDetails: {
          Type: 'EES_TOKEN_PAYMENT',
          Currency: totalCurrency,
          CustomerIP: ip,
          PaymentMethod: {
            EesToken: 'tokenacquiredfromabove',
            Vendor3DSReturnURL: this.rezdyOptions.twoCheckout
              .vendor3DSReturnURL,
            Vendor3DSCancelURL: this.rezdyOptions.twoCheckout.vendor3DSCancelURL
          }
        }
      }
      console.log(this.fields)
      console.log(checkoutDetails)

      const test = await this.$axios.$post(`2checkout/orders/`, checkoutDetails)

      console.log(test)

      /* const order = await this.$rezdy.placeOrder({
        ...this.booking,
        fields: this.fields,
        status: 'PROCESSING',
        payments: [
          {
            type: 'CREDITCARD',
            amount: totalDue,
            currency: totalCurrency,
            label: 'Payment processed by 2Checkout'
          }
        ]
      })

      const { booking } = order

      this.processing = false

      if (order.error) {
        this.handleError({ message: order.error.split(';')[0] })
        return
      }

      this.$emit('confirmation', { booking })
      this.$ecommerce.trackPurchase({ booking }) */
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
