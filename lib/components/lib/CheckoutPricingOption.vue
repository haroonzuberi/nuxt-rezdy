<template>
  <b-field :label="option.label" class="pricing-option">
    <b-numberinput
      v-model="optionValue"
      size="is-medium"
      :min="optionMinQuantity"
      :max="optionMaxQuantity"
      :type="optionValue > 0 ? 'is-primary' : 'is-grey'"
    />
  </b-field>
</template>

<script>
export default {
  name: 'CheckoutPricingOption',
  props: {
    option: {
      type: Object,
      default: () => null
    },
    session: {
      type: Object,
      default: () => null
    },
    quantities: {
      type: Array,
      default: () => []
    },
    groupOption: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: 0
    },
    totalGuests: {
      type: Number,
      default: 0
    }
  },
  computed: {
    optionValue: {
      get() {
        if (!this.quantities || !this.quantities.length)
          return this.optionMinQuantity
        const quantity = this.quantities.find(
          v => v.optionId === this.option.id
        )
        return quantity ? +quantity.value : 0
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    optionMinQuantity() {
      return this.groupOption
        ? Math.min(
            ...this.session.priceOptions.map(option => option.minQuantity)
          )
        : this.min
    },
    optionMaxQuantity() {
      const { seats, seatsAvailable } = this.session
      // TODO: need to ignore booked sessions for global picker
      const available = this.ignoreAvailability
        ? this.max
        : Math.min(seats || Infinity, seatsAvailable, this.max)
      const current = this.quantities.find(
        quantity => this.option.id === quantity.optionId
      )
      const currentValue =
        (current ? +current.value : 0) * (this.option.seatsUsed || 1)
      const max =
        available -
        (available % this.option.seatsUsed) -
        this.totalGuests +
        currentValue

      return this.groupOption ? max : Math.floor(max / this.option.seatsUsed)
    }
  }
}
</script>

<style scoped>
.pricing-option::v-deep .field-body {
  flex-grow: 1;
}
</style>
