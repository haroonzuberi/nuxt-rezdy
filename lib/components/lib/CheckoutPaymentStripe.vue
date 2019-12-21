<template>
    <form @submit.prevent="handleSubmit" id="payment-form">
        <label class="label" for="card-element">
            Credit or debit card
        </label>
        <div id="card-element" class="input" :class="cardClass">
            Loading...
        </div>
        <b-button
            native-type="submit"
            type="is-success"
            size="is-large"
            :disabled="!canPay || !valid"
            icon-left="lock">
            {{ $t('pay') }}
        </b-button>
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
        bookingFields: {
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
            processing: false
        }
    },
    computed: {
        ...mapState({
            booking: state => state.booking
        })
    },
    mounted() {
        if(window.Stripe) {
            this.buildForm()
        }
    },
    head() {
        return {
            script: [
                {
                    hid: 'stripeElements',
                    src: 'https://js.stripe.com/v3/',
                    type: 'text/javascript',
                    callback: () => this.buildForm()
                }
            ]
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
            this.stripe = Stripe(publishableKey, { locale: this.$i18n.locale });
            this.elements = this.stripe.elements({ fonts });
            this.card = this.elements.create('card', { style })
            this.card.mount('#card-element')
            this.card.on('focus', () => this.cardClass = 'is-active')
            this.card.on('blur', () => this.cardClass = '')
            this.card.on('change', event => {
                if (event.complete) {
                    this.valid = true
                } else if (event.error) {
                    this.valid = false
                }
            })
        },
        async handleSubmit() {
            this.processing = true
            const { token, error } = await this.stripe.createToken(this.card);

            if(error) {
                this.handleError({message: error.message})
                return
            }

            const order = await this.$rezdy.placeOrder({
                ...this.booking,
                fields: this.fields,
                creditCard: {
                    cardToken: token.id
                }
            })

            this.processing = false

            if (order.error) {
                this.handleError({message: order.error.split(';')[0]})
            }
        }
    }
}
</script>

<style scoped>
#card-element {
    display: block;
}
</style>