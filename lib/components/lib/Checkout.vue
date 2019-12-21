<template>
    <section class="section" v-if="quote && quote.items && quote.items.length">
        <div style="width:100%">
            <checkout-order-summary  />
            <checkout-vouchers />
            <checkout-payment :processor="$rezdy.cardProcessor" />
        </div>
    </section>
    <section class="section" v-else-if="!loading">
        <div class="content has-text-centered">
            <h1>{{$t('empty-cart')}}</h1>
            <b-button type="is-primary" size="is-medium" @click="$parent.close()">{{ $t('done') }}</b-button>
        </div>
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

<style scoped>
.section {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>