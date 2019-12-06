<template>
    <div class="section">
        <div class="container" v-if="product">
            {{ hasExtras }}
            <b-steps :has-navigation="false" v-model="currentStep">
                <b-step-item :label="steps[0].name" :icon="steps[0].icon">
                    <checkout-session-select :product-code="productCode" :session.sync="selectedSession" />
                </b-step-item>
                <b-step-item :label="steps[1].name" :icon="steps[1].icon">
                    <checkout-pricing-select
                        v-if="selectedSession"
                        :total-guests="totalGuests"
                        :session="selectedSession"
                        :max="product.quantityRequiredMax"
                        :guests.sync="guests"
                    />
                    <checkout-participants
                        v-if="hasParticipantFields"
                        :product="product"
                        :total-guests="totalGuests"
                        :participants.sync="participants"
                        :valid.sync="participantsValid"
                    />
                    <checkout-booking-fields
                        :product="product"
                        :fields.sync="bookingFields"
                        :valid.sync="bookingFieldsValid"
                    />
                </b-step-item>
                <b-step-item :label="steps[2].name" :icon="steps[2].icon" v-if="hasExtras">
                    <checkout-extras :product="product" />
                </b-step-item>
                <b-step-item :label="steps[3].name" :icon="steps[3].icon">
                    I'm whatever
                </b-step-item>
            </b-steps>
            <div class="level">
                <div class="level-left">
                    <b-button class="level-item" @click="$parent.close()">
                        {{ $parent.$t('cancel') }}
                    </b-button>
                </div>
                <div class="level-right">
                    <b-button
                        class="level-item"
                        type="is-success"
                        size="is-medium"
                        @click="next()"
                        :disabled="!valid"
                    >
                        {{ $parent.$t('continue') }}
                    </b-button>
                </div>
            </div>
        </div>
        <b-loading :is-full-page="false" :active="!product" />
    </div>
</template>
<script>
import CheckoutSessionSelect from './CheckoutSessionSelect.vue'
import CheckoutPricingSelect from './CheckoutPricingSelect.vue'
import CheckoutBookingFields from './CheckoutBookingFields.vue'
import CheckoutParticipants from './CheckoutParticipants.vue'
import CheckoutExtras from './CheckoutExtras.vue'

export default {
    name: 'ProductBookingFlow',
    components: {
        CheckoutSessionSelect,
        CheckoutPricingSelect,
        CheckoutBookingFields,
        CheckoutParticipants,
        CheckoutExtras
    },
    props: {
        productCode: {
            type: String,
            default: null
        },
        session: {
            type: Object,
            default: () => null
        }
    },
    data() {
        return {
            currentStep: 0,
            selectedSession: null,
            product: null,
            guests: [],
            participants: [],
            participantsValid: false,
            bookingFields: [],
            bookingFieldsValid: false,
            steps: [
                {
                    name: 'Schedule',
                    icon: 'calendar',
                    valid: () => !!this.selectedSession
                },
                {
                    name: 'Info',
                    icon: 'user',
                    valid: () => this.totalQuantity > 0 && this.bookingFieldsValid && (!this.hasParticipantFields || this.participantsValid)
                },
                {
                    name: 'Extras', icon: 'plus', valid: () => true
                },
                {
                    name: 'checkout',
                    icon: 'money-bill-wave',
                    valid: () => false
                }
            ]
        }
    },
    computed: {
        valid() {
            return this.steps[this.currentStep].valid()
        },
        totalQuantity() {
            return this.guests
                .map(option => option.value)
                .reduce((acc, count) => acc + count, 0);
        },
        totalGuests() {
            return this.guests
                .map(
                    option =>
                        option.value * this.selectedSession.priceOptions.find(p => p.id === option.optionId).seatsUsed
                )
                .reduce((acc, count) => acc + count, 0);
        },
        hasParticipantFields() {
            return this.product && this.product.bookingFields.some(field => field.visiblePerParticipant)
        },
        hasExtras() {
            return this.product && this.product.extras && this.product.extras.length
        }
    },
    watch: {
        selectedSession:{
            handler(session) {
                console.log(session);
                if(session) {
                    this.currentStep = 1
                }
            },
            immediate: true
        }
    },
    mounted: async function(){
        if(this.session) {
            this.selectedSession = this.session
        }
        const { products } = await this.$parent.$rezdy.getProducts({productCode: [this.productCode]})
        this.product = products[0]
    },
    methods: {
        next() {
            this.currentStep = this.currentStep + 1;
        }
    }
}
</script>

<style scoped>
.section {
    min-height: 300px
}
.participants-enter-active, .participants-leave-active {
  transition: all 250ms ease-in-out;
}
.participants-enter, .participants-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: scale(0.5);
}
</style>