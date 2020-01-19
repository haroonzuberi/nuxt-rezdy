<template>
    <div class="rezdy-checkout-payment">
        <h2 class="title is-4">{{ $t('billing-contact') }}</h2>
        <checkout-booking-fields :fields.sync="fields" :valid.sync="hasValidBookingFields" hide-optional />
        <h2 class="title is-4">{{ $t('payment') }}</h2>
        <div class="message">
            <div class="message-body">
                <component
                    :is="paymentComponent"
                    :booking-fields="bookingFields"
                    :can-pay="hasValidBookingFields"
                    :fields="fields"
                    @processing="status => processing = status"
                    @confirmation="handleConfirmation"
                />
            </div>
        </div>
    </div>
</template>

<i18n src="./lang.json"></i18n>

<script>

import { createNamespacedHelpers } from 'vuex';
const { mapActions } = createNamespacedHelpers('rezdy/booking')
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
            hasValidBookingFields: false,
            processing: false
        }
    },
    computed: {
        paymentComponent() {
            return this.paymentComponents[this.processor]
        },
        bookingFields() {
            return []
        }
    },
    methods: {
        ...mapActions([
            'clearBooking'
        ]),
        handleConfirmation(confirmation) {
            this.$parent.$parent.close()
            this.clearBooking()
            this.$buefy.modal.open({
                parent: this,
                component: () => import('./CheckoutConfirmation.vue'),
                props: { ...confirmation },
                canCancel: false
            })
        }
    }
}
</script>