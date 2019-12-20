<template>
    <div class="section booking-flow" ref="bookingFlow">
        <div class="container" v-if="product" >
            <checkout-overview
                id="booking-checkout-overview"
                :product="product"
                :session="selectedSession"
                :quantities="quantities"
                :participants-fields="participants"
                :booking-fields="bookingFields"
                :extras="extras"
            />
            <b-steps :has-navigation="false" v-model="currentStep" @change="handleStepChange">

                <!-- STEP 1: Session Select -->
                <b-step-item :label="$t(steps[0].name)" :icon="steps[0].icon">
                    <checkout-session-select
                        :product="product"
                        :session.sync="selectedSession"
                    />
                </b-step-item>

                <!-- STEP 2: Quantities / Booking Info -->
                <b-step-item
                    :label="$t(steps[1].name)"
                    :icon="steps[1].icon"
                    :clickable="this.steps[0].isValid()"
                >
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
                </b-step-item>

                <!-- STEP 3: Extras -->
                <b-step-item
                    :label="$t(steps[2].name)"
                    :icon="steps[2].icon"
                    v-if="!steps[2].isDisabled()"
                    :clickable="this.steps[1].isValid()"
                >
                    <checkout-extras
                        :product="product"
                        :extras.sync="extras"
                    />
                </b-step-item>

                <!-- STEP 4: Payment -->
                <b-step-item
                    :label="$t(steps[3].name)"
                    :icon="steps[3].icon"
                    :clickable="this.steps[2].isValid()"
                >
                    <div class="columns">
                        <div class="column">
                            <h2 class="title is-4">{{$t('summary')}}</h2>
                            <checkout-order-summary
                                :quantities="quantities"
                                :extras="extras"
                                :total-amount="totalAmount"
                                :taxes-and-fees="taxesAndFees"
                                :total-paid="totalPaid"
                                :total-due="totalDue"
                                :currency="product.currency"
                            />
                            <checkout-vouchers :vouchers.sync="vouchers" />
                        </div>
                        <div class="column">
                            <checkout-booking-fields
                                :product="product"
                                :fields.sync="bookingFields"
                                :valid.sync="bookingFieldsValid"
                            />
                            <h2 class="title is-4">{{ $t('payment-heading') }}</h2>
                        </div>
                    </div>
                </b-step-item>
            </b-steps>
            <div id="booking-flow-controls" class="level">
                <div class="level-left">
                    <b-button class="level-item booking-control-previous" type="is-success" outlined @click="prev()" :disabled="currentStep === 0">
                        {{ $t('previous') }}
                    </b-button>
                    <b-button class="level-item booking-control-next" @click="$parent.close()">
                        {{ $t('cancel') }}
                    </b-button>
                </div>
                <div class="level-item" v-if="totalDue > 0 || loadingTotal">
                    <span v-if="!loadingTotal" class="booking-checkout-total">
                        {{ totalDue | currency($i18n.locale, product.currency) }}
                    </span>
                    <span v-else>{{$t('loading')}} ...</span>
                </div>
                <div class="level-right">
                    <b-button
                        class="level-item booking-control-continue"
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

import { createNamespacedHelpers } from 'vuex';
const { mapActions, mapState } = createNamespacedHelpers('rezdy/booking')

import debounce from 'lodash/debounce'

import CheckoutSessionSelect from './CheckoutSessionSelect.vue'
import CheckoutPricingSelect from './CheckoutPricingSelect.vue'
import CheckoutBookingFields from './CheckoutBookingFields.vue'
import CheckoutParticipants from './CheckoutParticipants.vue'
import CheckoutExtras from './CheckoutExtras.vue'
import CheckoutOverview from './CheckoutOverview.vue'
import CheckoutVouchers from './CheckoutVouchers.vue'
import CheckoutOrderSummary from './CheckoutOrderSummary.vue'
import CheckoutPayment from './CheckoutPayment.vue'

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
        CheckoutOrderSummary,
        CheckoutPayment
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
                    isDisabled: () => false,
                    isValid: () => !!this.selectedSession
                },
                {
                    name: 'info',
                    icon: 'user',
                    isDisabled: () => false,
                    isValid: () =>
                        this.totalQuantity > 0 &&
                        (!this.hasParticipantFields || this.participantsValid)
                },
                {
                    name: 'extras',
                    icon: 'plus',
                    isDisabled: () => !this.hasExtras,
                    isValid: () => true
                },
                {
                    name: 'checkout',
                    icon: 'money-bill-wave',
                    isDisabled: () => false,
                    isValid: () => false
                }
            ]
        }
    },
    computed: {
        ...mapState({
            booking: state => state.booking
        }),
        valid() {
            return this.steps[this.currentStep].isValid()
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
        currentStep(step) {
            if(this.steps[step].name === 'checkout') {
                this.addToBooking()
            }
        },
        selectedSession:{
            handler(session) {
                if(session) {
                    this.currentStep = 1
                }
            },
            immediate: true
        },
        quote: debounce(async function({session, quantities, extras, vouchers}) {
            this.loadingTotal = true
            const { booking } = await this.$rezdy.getQuote({
                items: [{ ...session, quantities, extras }],
                vouchers
            })
            const { totalDue, totalAmount, items, totalPaid } = booking
            this.totalDue = totalDue
            this.totalAmount = totalAmount
            this.totalPaid = totalPaid
            this.taxesAndFees = (items || []).reduce((total, item) => total + (item.totalItemTax || 0), 0)
            this.loadingTotal = false
        }, 200) 
    },
    mounted: async function(){
        if(this.session) {
            this.selectedSession = this.session
        }

        const { product } = await this.$parent.$rezdy.getProductByCode(this.productCode)
        
        this.product = product
    },
    methods: {
        ...mapActions([
        'addItem'
        ]),
        next() {
            this.stepBy(1)
        },
        prev() {
            this.stepBy(-1)
        },
        stepBy(direction) {
            const step = (d) => this.currentStep = this.currentStep + d
            this.steps[this.currentStep + direction].isDisabled() ? step(direction + Math.sign(direction)) : step(direction)
            if(this.currentStep === 0) {
                this.selectedSession = null
                this.quantities = []
                this.extras = []
            }
        },
        handleStepChange(step) {
            this.$refs.bookingFlow.parentNode.scroll({
                top: 0, 
                left: 0
            })
        },
        addToBooking() {
            const { productCode, startTimeLocal, endTimeLocal } = this.selectedSession
            const item = {
                productCode,
                startTimeLocal,
                endTimeLocal,
                quantities: this.quantities,
                extras: this.extras
            }
            this.addItem({
                item,
                product: this.product,
                vouchers: this.vouchers
            })
            this.$nextTick(async () => {
                this.$parent.close()
                this.$rezdy.checkout(this)
            })
        }
    }
}
</script>

<style>
.booking-flow {
    min-height: 300px;
}
.participants-enter-active, .participants-leave-active {
  transition: all 250ms ease-in-out;
}
.participants-enter, .participants-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: scale(0.5);
}

.booking-checkout-total {
    font-size: 2rem;
}

@media only screen and (max-width: 600px) {
    .booking-flow {
        padding: 1rem 0.75rem;
    }
    .booking-flow .title {
        font-size: 2rem;
    }

    #booking-checkout-overview {
        display: none;
    }

    #booking-flow-controls {
        display: flex;
        flex-direction: column;
    }

    #booking-flow-controls .level-right {
        width: 100%;
        order: 1;
    }

    #booking-flow-controls .level-right .button {
        width: 100%;
    }

    #booking-flow-controls .level-left {
        order: 3;
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 1rem;
    }
    #booking-flow-controls .level-left .button {
        margin: 0;
    }
}
</style>