<template>
    <div class="section" ref="checkout">
        <div class="container" v-if="product" >
            <checkout-overview
                :product="product"
                :session="selectedSession"
                :quantities="quantities"
                :participants-fields="participants"
                :booking-fields="bookingFields"
                :extras="extras"
            />
            <b-steps :has-navigation="false" v-model="currentStep" @change="handleStepChange">
                <b-step-item :label="$t(steps[0].name)" :icon="steps[0].icon">
                    <checkout-session-select
                        :product-code="productCode"
                        :session.sync="selectedSession"
                    />
                </b-step-item>
                <b-step-item :label="$t(steps[1].name)" :icon="steps[1].icon">
                    <checkout-pricing-select
                        v-if="selectedSession"
                        :total-guests="totalGuests"
                        :session="selectedSession"
                        :product="product"
                        :max="product.quantityRequiredMax"
                        :quantities.sync="quantities"
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
                <b-step-item :label="$t(steps[2].name)" :icon="steps[2].icon" v-if="hasExtras">
                    <checkout-extras
                        :product="product"
                        :extras.sync="extras"
                    />
                </b-step-item>
                <b-step-item :label="$t(steps[3].name)" :icon="steps[3].icon">
                    <div class="columns">
                        <div class="column">
                            Order Summary
                            <checkout-order-summary
                                :quantities="quantities"
                                :extras="extras"
                                :total-amount="totalAmount"
                                :taxes-and-fees="taxesAndFees"
                                :total-paid="totalPaid"
                                :total-due="totalDue"
                                :currency="product.currency"
                            />
                        </div>
                        <div class="column">
                            <checkout-vouchers :vouchers.sync="vouchers" />
                        </div>
                    </div>
                </b-step-item>
            </b-steps>
            <div class="level">
                <div class="level-left">
                    <b-button class="level-item" @click="prev()" :disabled="currentStep === 0">
                        {{ $t('previous') }}
                    </b-button>
                    <b-button class="level-item" @click="$parent.close()">
                        {{ $t('cancel') }}
                    </b-button>
                </div>
                <div class="level-item" v-if="totalDue > 0 || loadingTotal">
                    <span v-if="!loadingTotal" class="checkout-total">
                        {{ totalDue | currency($i18n.locale, product.currency) }}
                    </span>
                    <span v-else class="checkout-total-loading">{{$t('loading')}} ...</span>
                </div>
                <div class="level-right">
                    <b-button
                        class="level-item"
                        type="is-success"
                        size="is-large"
                        @click="next()"
                        :disabled="!valid"
                    >
                        {{ $t('continue') }}
                    </b-button>
                </div>
            </div>
        </div>
        <b-loading :is-full-page="false" :active="!product" />
    </div>
</template>

<i18n src="./lang.json" ></i18n>

<script>

import debounce from 'lodash/debounce'

import CheckoutSessionSelect from './CheckoutSessionSelect.vue'
import CheckoutPricingSelect from './CheckoutPricingSelect.vue'
import CheckoutBookingFields from './CheckoutBookingFields.vue'
import CheckoutParticipants from './CheckoutParticipants.vue'
import CheckoutExtras from './CheckoutExtras.vue'
import CheckoutOverview from './CheckoutOverview.vue'
import CheckoutVouchers from './CheckoutVouchers.vue'
import CheckoutOrderSummary from './CheckoutOrderSummary.vue'

export default {
    name: 'ProductBookingFlow',
    components: {
        CheckoutSessionSelect,
        CheckoutPricingSelect,
        CheckoutBookingFields,
        CheckoutParticipants,
        CheckoutExtras,
        CheckoutOverview,
        CheckoutVouchers,
        CheckoutOrderSummary
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
            loadingTotal: false,
            selectedSession: null,
            product: null,
            quantities: [],
            participants: [],
            participantsValid: false,
            bookingFields: [],
            bookingFieldsValid: false,
            totalDue: 0,
            totalAmount: 0,
            totalPaid: 0,
            taxesAndFees: 0,
            extrasTotal: 0,
            extras: [],
            vouchers: [],
            steps: [
                {
                    name: 'schedule',
                    icon: 'calendar',
                    valid: () => !!this.selectedSession
                },
                {
                    name: 'info',
                    icon: 'user',
                    valid: () =>
                        this.totalQuantity > 0 &&
                        this.bookingFieldsValid &&
                        (!this.hasParticipantFields || this.participantsValid)
                },
                {
                    name: 'extras', icon: 'plus', valid: () => true
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
        quote() {
            return {
                session: this.selectedSession,
                quantities: this.quantities,
                extras: this.extras,
                vouchers: this.vouchers
            }
        },
        totalQuantity() {
            return this.quantities
                .map(option => option.value)
                .reduce((acc, count) => acc + count, 0);
        },
        totalGuests() {
            return !this.selectedSession ? 0 : this.quantities
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
                if(session) {
                    this.currentStep = 1
                }
            },
            immediate: true
        },
        quote: debounce(async function(value) {
            this.loadingTotal = true
            const { booking } = await this.$rezdy.getQuote(value)
            const { totalDue, totalAmount, items, totalPaid } = booking
            this.totalDue = totalDue
            this.totalAmount = totalAmount
            this.totalPaid = totalPaid
            this.taxesAndFees = items.reduce((total, item) => total + (item.totalItemTax || 0), 0)
            this.loadingTotal = false
        }, 200) 
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
            this.stepBy(1)
        },
        prev() {
            this.stepBy(-1)
        },
        stepBy(direction) {
            this.currentStep = this.currentStep + direction
            if(this.currentStep === 0) {
                this.selectedSession = null
                this.quantities = []
                this.extras = []
            }
        },
        handleStepChange(step) {
            this.$refs.checkout.parentNode.scroll({
                top: 0, 
                left: 0
            })
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

.checkout-total {
    font-size: 2rem;
}
</style>