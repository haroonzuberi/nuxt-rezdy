<template>
    <section class="section" v-if="quote && quote.items && quote.items.length">
        <div style="width:100%">
            <h1 class="title">{{ $t('shopping-cart') }}</h1>
            <checkout-order-summary :booking="quote"  />
            <checkout-payment :processor="$rezdy.cardProcessor" />
            <b-loading :is-full-page="false" :active="loading" />
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
import CheckoutPayment from './CheckoutPayment.vue'
export default {
    name: 'CheckoutCart',
    components: {
        CheckoutPayment,
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