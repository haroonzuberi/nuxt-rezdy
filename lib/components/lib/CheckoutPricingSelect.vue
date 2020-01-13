<template>
  <div>
    <h2 class="title">{{ $t('select') }} {{ product.unitLabelPlural }}</h2>
    <div class="columns is-multiline">
      <!-- Group Options -->
      <div v-if="activeGroupOption" class="column is-one-third">
        <b-field
          :message="
            activeGroupOption.price | currency($i18n.locale, product.currency)
          "
          class="pricing-option-field"
        >
          <checkout-pricing-option
            :session="session"
            :quantities="quantities"
            :total-guests="totalGuests"
            :option="activeGroupOption"
            :max="max"
            controls-position="compact"
            @input="updateGroupCount($event)"
            group-option
          />
        </b-field>
        <div v-if="session.priceOptions && session.priceOptions.length > 1">
          <b-collapse aria-id="groupPricing" position="is-bottom" :open="true">
            <p
              class="has-text-centered is-size-7"
              slot="trigger"
              slot-scope="props"
              role="button"
              aria-controls="groupPricing"
            >
              <a>{{
                $t('toggle-group-pricing', {
                  action: props.open ? $t('hide') : $t('show')
                })
              }}</a>
            </p>
            <table class="table is-fullwidth is-bordered">
              <thead>
                <th colspan="2" class="has-text-centered">
                  {{ $t('group-pricing') }}
                </th>
              </thead>
              <tbody class="is-size-7">
                <tr
                  v-for="(option, o) of session.priceOptions"
                  :key="o"
                  :class="{ 'is-selected': activeGroupOption === option }"
                >
                  <th>{{ option.label }}</th>
                  <td class="is-numeric">
                    {{
                      option.price | currency($i18n.locale, product.currency)
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </b-collapse>
        </div>
      </div>
      <!-- Individual Options -->
      <div
        class="column is-one-third"
        v-for="option of individualOptions"
        :key="option.id"
      >
        <b-field
          :message="option.price | currency($i18n.locale, product.currency)"
          class="pricing-option-field"
        >
          <checkout-pricing-option
            :session="session"
            :quantities="quantities"
            :total-guests="totalGuests"
            :option="option"
            :max="max"
            :min="0"
            controls-position="compact"
            @input="updateGuestCounts(option, $event)"
          />
        </b-field>
      </div>
    </div>
  </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import locale from '../../mixins/locale'
import CheckoutPricingOption from './CheckoutPricingOption.vue'
export default {
  name: 'CheckoutPricingSelect',
  mixins: [locale],
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
      quantities: []
    }
  },
  computed: {
    activeGroupOption() {
      return (
        this.groupOptions.find(option =>
          this.quantities.some(g => g.optionId === option.id)
        ) ||
        this.groupOptions.find(
          option =>
            option.minQuantity ===
            Math.min(...this.groupOptions.map(option => option.minQuantity))
        )
      )
    },
    groupOptions() {
      return this.session.priceOptions.filter(
        option => option.priceGroupType && option.priceGroupType === 'EACH'
      )
    },
    individualOptions() {
      return this.session.priceOptions.filter(option => !option.priceGroupType)
    }
  },
  created() {
    this.quantities = this.value
  },
  methods: {
    valueInOptionRange(value, option) {
      return value <= option.maxQuantity && value >= option.minQuantity
    },
    updateGroupCount(value) {
      const groupOption = this.groupOptions.find(option =>
        this.valueInOptionRange(value, option)
      )

      const outOfRange = this.groupOptions.filter(
        option => !this.valueInOptionRange(value, option)
      )
      this.quantities = this.quantities.filter(
        guest => !outOfRange.some(option => option.id === guest.optionId)
      )
      this.updateGuestCounts(groupOption, value)
    },
    updateGuestCounts(option, value) {
      if (!option) return
      const update = {
        value,
        optionLabel: option.label,
        optionPrice: option.price,
        optionId: option.id
      }
      const idx = this.quantities.findIndex(g => g.optionId === option.id)
      this.quantities =
        idx > -1
          ? [
              ...this.quantities.slice(0, idx),
              update,
              ...this.quantities.slice(idx + 1)
            ]
          : [...this.quantities, update]

      this.$emit(
        'update:quantities',
        this.quantities.filter(guest => guest.value > 0)
      )
    }
  }
}
</script>

<style scoped>
.columns {
  justify-content: space-around;
  margin-bottom: 2rem;
}

.column::v-deep .label {
  text-align: center;
  font-weight: bold;
}

.pricing-option-field::v-deep .help {
  text-align: center;
  font-size: 16px;
}
</style>
