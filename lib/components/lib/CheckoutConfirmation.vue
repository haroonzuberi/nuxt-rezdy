<template>
    <div class="section is-large checkout-confirmation" v-if="booking">
        <h1 class="title">{{$t('thank-you-order')}}</h1>
        <p class="subtitle is-5">
            {{$t('thank-you-order-no')}}
            {{ booking.orderNumber }}
        </p>
        <checkout-order-summary :booking="booking" is-confirmation  />
        <div class="confirmation-actions">
            <b-button type="is-dark" outlined size="is-medium" @click="printConfirmation">
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
import CheckoutOrderSummary from './CheckoutOrderSummary.vue'
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
    methods: {
        printConfirmation() {
            if (typeof window !== 'undefined') window.print();
        }
    }
}
</script>

<style scoped>

.confirmation-actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.confirmation-actions > .button {
    margin: 4px;
} 

@media print { 
    .confirmation-actions {
        display: none;
    }
}
</style>