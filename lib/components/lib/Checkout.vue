<template>
    <section class="section" v-if="quote && quote.items && quote.items.length">
        <checkout-order-summary  />
        <checkout-vouchers />
        <checkout-payment  />
    </section>
    <section class="section" v-else-if="!loading">
        <p>Your cart is empty.</p>
    </section>
    <section class="section" v-else>
        <b-loading :is-full-page="false" active />
    </section>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('rezdy/booking')
import CheckoutOrderSummary from './CheckoutOrderSummary.vue'
import CheckoutVouchers from './CheckoutVouchers.vue'
import CheckoutPayment from './CheckoutPayment.vue'
export default {
    name: 'CheckoutCart',
    components: {
        CheckoutPayment,
        CheckoutVouchers,
        CheckoutOrderSummary
    },
    data() {
        return {
            vouchers: []
        }
    },
    computed: {
        ...mapState({
            booking: state => state.booking,
            quote: state => state.quote,
            loading: state => state.loading.quote
        })
    }
}
</script>