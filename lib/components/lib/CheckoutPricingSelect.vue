<template>
  <div>
    Pricing Select
    <div v-for="option of individualOptions" :key="option.id">
        <checkout-pricing-option
          :session="session"
          :guests="guests"
          :total-guests="totalGuests"
          :option="option"
          :max="max"
          :min="0"
          @input="updateGuestCounts(option, $event)"
        />
    </div>
  </div>
</template>
<script>
import CheckoutPricingOption from './CheckoutPricingOption.vue'
export default {
  name: "CheckoutPricingSelect",
  components: {
      CheckoutPricingOption
  },
  props: {
    session: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    },
    max: {
        type: Number,
        default: Infinity
    },
    hideActions: {
      type: Boolean,
      default: false
    },
    ignoreAvailability: {
      type: Boolean,
      default: false
    },
    totalGuests: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      guests: []
    };
  },
  computed: {
    activeGroupOption() {
      return (
        this.groupOptions.find(option =>
          this.guests.some(g => g.optionId === option.id)
        ) ||
        this.groupOptions.find(
          option =>
            option.minQuantity ===
            Math.min(...this.groupOptions.map(option => option.minQuantity))
        )
      );
    },
    groupOptions() {
      return this.session.priceOptions.filter(
        option => option.priceGroupType && option.priceGroupType === "EACH"
      );
    },
    individualOptions() {
      return this.session.priceOptions.filter(option => !option.priceGroupType);
    }
  },
  methods: {
    valueInOptionRange(value, option) {
      return value <= option.maxQuantity && value >= option.minQuantity;
    },
    updateGroupCount(value) {
      const groupOption = this.groupOptions.find(option =>
        this.valueInOptionRange(value, option)
      );

      const outOfRange = this.groupOptions.filter(
        option => !this.valueInOptionRange(value, option)
      );
      this.guests = this.guests.filter(
        guest => !outOfRange.some(option => option.id === guest.optionId)
      );
      this.updateGuestCounts(groupOption, value);
    },
    updateGuestCounts(option, value) {
      const update = {
        value: value,
        optionLabel: option.label,
        optionPrice: option.price,
        optionId: option.id
      };
      const idx = this.guests.findIndex(g => g.optionId === option.id);
      this.guests =
        idx > -1
          ? [
              ...this.guests.slice(0, idx),
              update,
              ...this.guests.slice(idx + 1)
            ]
          : [...this.guests, update];

      this.$emit("update:guests", this.guests);
    }
  },
  created: function() {
    this.guests = this.value;
  }
};
</script>
