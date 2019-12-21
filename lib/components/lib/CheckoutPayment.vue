<template>
    <div class="rezdy-checkout-payment">
        <checkout-booking-fields :fields.sync="fields" :valid.sync="hasValidBookingFields" hide-optional />
        <component :is="paymentComponent" :booking-fields="bookingFields" :can-pay="hasValidBookingFields" />
    </div>
</template>

<script>
import CheckoutBookingFields from './CheckoutBookingFields.vue'
export default {
    name: 'CheckoutPayment',
    components: {
        CheckoutBookingFields
    },
    props: {
        processor: {
            type: String,
            default: 'custom'
        }
    },
    data() {
        return {
            paymentComponents: {
                stripe: () => import('./CheckoutPaymentStripe'),
                custom: () => import('./CheckoutPaymentCustom')
            },
            fields: [],
            hasValidBookingFields: false
        }
    },
    computed: {
        paymentComponent() {
            return this.paymentComponents[this.processor]
        },
        bookingFields() {
            return []
        }
    }
}
</script>