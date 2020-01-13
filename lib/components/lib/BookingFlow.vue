<template>
  <div class="section booking-flow" ref="bookingFlow">
    <div class="container" v-if="product">
      <checkout-overview
        id="booking-checkout-overview"
        :product="product"
        :session="selectedSession"
      />
      <b-steps
        :has-navigation="false"
        v-model="currentStep"
        @change="handleStepChange"
      >
        <!-- STEP 1: Session Select -->
        <b-step-item
          :label="$t(steps[0].name)"
          :icon="steps[0].icon"
          v-if="!steps[0].isDisabled()"
        >
          <checkout-session-select
            :product="product"
            :session.sync="selectedSession"
          />
        </b-step-item>

        <!-- STEP 2: Quantities / Booking Info -->
        <b-step-item
          :label="$t(steps[1].name)"
          :icon="steps[1].icon"
          :clickable="steps[0].isValid()"
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
          <b-loading
            :is-full-page="false"
            :active="!selectedSession"
            style="overflow:visible"
          />
        </b-step-item>

        <!-- STEP 3: Extras -->
        <b-step-item
          :label="$t(steps[2].name)"
          :icon="steps[2].icon"
          v-if="!steps[2].isDisabled()"
          :clickable="this.steps[1].isValid()"
        >
          <checkout-extras :product="product" :extras.sync="extras" />
        </b-step-item>

        <!-- STEP 4: Pickup Locations -->
        <b-step-item
          :label="$t(steps[3].name)"
          :icon="steps[3].icon"
          v-if="!steps[3].isDisabled()"
          :clickable="this.steps[2].isValid() && this.steps[1].isValid()"
        >
          <checkout-pickup-locations
            :locations="pickupLocations"
            :selected.sync="selectedPickupLocation"
          />
        </b-step-item>

        <!-- STEP 5: Payment -->
        <b-step-item
          :label="$t(steps[4].name)"
          :icon="steps[4].icon"
          :clickable="
            this.steps[3].isValid() &&
              this.steps[2].isValid() &&
              this.steps[1].isValid()
          "
        ></b-step-item>
      </b-steps>
      <div id="booking-flow-controls" class="level">
        <div class="level-left">
          <div class="level-item">
            <b-button
              class="booking-control-previous"
              type="is-success"
              outlined
              @click="prev()"
              :disabled="currentStep === 0"
            >
              {{ $t('previous') }}
            </b-button>
          </div>
          <div class="level-item">
          <b-button class="booking-control-next" @click="$parent.close()">
            {{ $t('cancel') }}
          </b-button>
          </div>
        </div>
        <div class="level-item" v-if="totalDue > 0 || loadingTotal">
          <span v-if="!loadingTotal" class="booking-checkout-total">
            {{ totalDue | currency($i18n.locale, product.currency) }}
          </span>
          <span v-else>{{ $t('loading') }} ...</span>
        </div>
        <div class="level-right">
          <div class="level-item">
            <b-button
              class="booking-control-continue"
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
    </div>
    <b-loading :is-full-page="false" :active="!product" />
  </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { format } from 'date-fns'
import { createNamespacedHelpers } from 'vuex'
import debounce from 'lodash/debounce'
import CheckoutSessionSelect from './CheckoutSessionSelect.vue'
import CheckoutPricingSelect from './CheckoutPricingSelect.vue'
import CheckoutParticipants from './CheckoutParticipants.vue'
import CheckoutExtras from './CheckoutExtras.vue'
import CheckoutOverview from './CheckoutOverview.vue'
import CheckoutPickupLocations from './CheckoutPickupLocations.vue'
const { mapActions, mapState } = createNamespacedHelpers('rezdy/booking')

export default {
  name: 'ProductBookingFlow',
  components: {
    CheckoutSessionSelect,
    CheckoutPricingSelect,
    CheckoutParticipants,
    CheckoutExtras,
    CheckoutOverview,
    CheckoutPickupLocations
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
      selectedPickupLocation: null,
      product: null,
      quantities: [],
      participants: [],
      participantsValid: false,
      bookingFields: [],
      bookingFieldsValid: false,
      pickupLocations: null,
      totalDue: 0,
      extras: [],
      steps: [
        {
          name: 'schedule',
          icon: 'calendar',
          isDisabled: () => !this.dateRequired,
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
          name: 'pickup',
          icon: 'map-marked',
          isDisabled: () => !this.hasPickupLocations,
          isValid: () => this.selectedPickupLocation
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
    activeSteps() {
      return this.steps.filter(step => !step.isDisabled())
    },
    valid() {
      return this.activeSteps[this.currentStep].isValid()
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
        .reduce((acc, count) => acc + count, 0)
    },
    totalGuests() {
      return !this.selectedSession
        ? 0
        : this.quantities
            .map(
              option =>
                option.value *
                this.selectedSession.priceOptions.find(
                  p => p.id === option.optionId
                ).seatsUsed
            )
            .reduce((acc, count) => acc + count, 0)
    },
    hasParticipantFields() {
      return (
        this.product &&
        this.product.bookingFields.some(field => field.visiblePerParticipant)
      )
    },
    hasExtras() {
      return this.product && this.product.extras && this.product.extras.length
    },
    hasPickupLocations() {
      return this.product.pickupId
    },
    dateRequired() {
      if (!this.product) return true
      return this.product.bookingMode !== 'NO_DATE'
    }
  },
  watch: {
    currentStep: {
      handler(step) {
        this.$ecommerce.trackCheckoutStep({
          step: this.currentStep + 1,
          option: this.steps[this.currentStep].name
        })
      },
      immediate: true
    },
    selectedSession: {
      handler(session) {
        if (session) {
          this.currentStep = this.dateRequired ? 1 : 0
        }
      },
      immediate: true
    },
    quote: debounce(async function({ session, quantities, extras, vouchers }) {
      this.loadingTotal = true
      const { booking } = await this.$rezdy.getQuote({
        items: [{ ...session, quantities, extras }],
        vouchers
      })
      const { totalDue } = booking
      this.totalDue = totalDue
      this.loadingTotal = false
    }, 200)
  },
  async mounted() {
    const { product } = await this.$parent.$rezdy.getProductByCode(
      this.productCode
    )
    const {
      pickupLocations
    } = await this.$parent.$rezdy.getProductPickupLocations(this.productCode)

    this.product = product
    this.pickupLocations = pickupLocations

    if (this.session) {
      this.selectedSession = this.session
    }

    if (!this.dateRequired) {
      const today = new Date()
      const startTimeLocal = format(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        'yyyy-MM-dd HH:mm:ss'
      )
      const endTimeLocal = format(
        new Date(today.getFullYear(), today.getFullYear(), today.getDate() + 7),
        'yyyy-MM-dd HH:mm:ss'
      )
      const { sessions } = await this.$parent.$rezdy.getSessions({
        productCode: this.productCode,
        startTimeLocal,
        endTimeLocal,
        rspc: 1
      })
      // select first available session (shouldn't matter which)
      this.selectedSession = sessions.find(s => s.seatsAvailable > 0)
    }

    this.$ecommerce.trackCheckoutAdd({ product })
  },
  methods: {
    ...mapActions(['addItem']),
    next() {
      if (this.isLastStep(this.currentStep - 1)) {
        this.addToBooking()
        return
      }
      this.stepBy(1)
    },
    prev() {
      this.stepBy(-1)
    },
    stepBy(direction) {
      this.currentStep = this.currentStep + direction
      if (this.currentStep === 0) {
        this.selectedSession = null
        this.quantities = []
        this.extras = []
      }
    },
    isLastStep(step) {
      return (step || this.currentStep) === this.activeSteps.length - 1
    },
    handleStepChange(step) {
      if (this.isLastStep() && this.totalQuantity > 0) {
        this.addToBooking()
        return
      }
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
        extras: this.extras,
        pickupLocation: this.selectedPickupLocation
      }
      this.addItem({
        item,
        product: this.product,
        vouchers: this.vouchers
      })
      this.$nextTick(() => {
        this.$parent.close()
        this.$rezdy.checkout(this)
      })
    }
  }
}
</script>

<style>
.booking-flow {
  background-color: var(--white);
  min-height: 300px;
}
.participants-enter-active,
.participants-leave-active {
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
    display: block;
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
