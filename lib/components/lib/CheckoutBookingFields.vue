<template>
  <form ref="form" @submit.prevent v-if="bookingFields && bookingFields.length">
    <div class="columns is-multiline">
      <checkout-field-input
        class="column"
        v-for="(field, f) of requiredFields"
        :key="field.label"
        ref="field"
        :field="field"
        @update="updateField(field, $event)"
        required
      />
    </div>
    <b-collapse
      :open.sync="expanded"
      aria-id="optionalFields"
      v-if="!hideOptional"
    >
      <div class="columns is-multiline">
        <checkout-field-input
          class="column"
          v-for="(field, f) of optionalFields"
          :key="field.label"
          ref="field"
          @update="updateField(field, $event)"
          :field="field"
        />
      </div>
      <button
        v-show="!expanded"
        class="button is-text is-pulled-right"
        slot="trigger"
        aria-controls="optionalFields"
      >
        {{ $t('add-detail') }}
      </button>
    </b-collapse>
  </form>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { uniqBy } from 'lodash'
import { createNamespacedHelpers } from 'vuex'
import CheckoutFieldInput from './CheckoutFieldInput.vue'
const { mapState } = createNamespacedHelpers('rezdy')

export default {
  name: 'CheckoutBookingFields',
  components: {
    CheckoutFieldInput
  },
  props: {
    hideOptional: {
      type: Boolean,
      default: false
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      expanded: false,
      products: []
    }
  },
  watch: {
    items: {
      async handler(items) {
        const { products } = await this.$rezdy.getProducts({
          productCode: items.map(i => i.productCode)
        })
        this.products = Object.values(products)
      },
      immediate: true
    }
  },
  computed: {
    ...mapState({
      items: state => state.booking.booking.items,
      rezdyOptions: state => state.options
    }),
    requiredFields() {
      return this.bookingFields.filter(field => field.requiredPerBooking)
    },
    optionalFields() {
      return this.bookingFields.filter(field => !field.requiredPerBooking)
    },
    bookingFields() {
      if (!this.items || !this.products) return []

      const bookingFields = this.products.reduce((fields, product) => {
        return [...fields, ...product.bookingFields]
      }, [])

      // Force booking fields if set in settings / required for checkout
      const fieldOverrides = (this.rezdyOptions.fieldOverrides || [])
        .filter(field => {
          if (!field.countries) return true
          const countrySelection = this.fields.find(field => field.label === 'Country')          
          if (!countrySelection) return false
          return field.countries.some(country => country === countrySelection.value)
        })
        .map(field => {
          const { label, fieldType } = field
          return {
            label,
            fieldType,
            requiredPerBooking: true,
            visiblePerBooking: true
          }
        })

      return uniqBy([...fieldOverrides, ...bookingFields], 'label')
        .filter(field => field.visiblePerBooking)
        .sort((a, b) => {
          // Put standard fields first
          const standardFields = [...this.$rezdy.standardFields].reverse()
          const aidx = standardFields.indexOf(a.label)
          const bidx = standardFields.indexOf(b.label)
          return aidx > bidx ? -1 : aidx < bidx ? 1 : 0
        })
        .sort((a, b) => {
          // Put required fields first
          return a.requiredPerBooking && b.requiredPerBooking
            ? 0
            : a.requiredPerBooking
            ? -1
            : 1
        })
        .filter(field => !(this.hideOptional && !field.requiredPerBooking))
    }
  },
  methods: {
    updateField(field, value) {
      const { label } = field
      const update = { label, value }
      const fields = [...this.fields.filter(f => f.label !== label), update]
      this.$emit('update:fields', fields)

      let validForm = this.$refs.form.checkValidity();

      if(field.fieldType === 'Phone') {
        const regex = /\+[1-9]{1}[0-9]{10,14}/g
        const trimed = value.replace(/\s/g, '')
        let validPhone = trimed.match(regex)
        validPhone = validPhone && validPhone.length !== 0
        this.$emit('update:phoneValid', validPhone)
      }
      this.$emit('update:valid', validForm)
    }
  }
}
</script>

<style scoped>
.columns {
  margin-top: 12px;
  margin-bottom: 12px;
}
.column {
  padding-top: 0;
  padding-bottom: 0;
}

.column.is-floating-in-label::v-deep .label,
.column.is-floating-label::v-deep .label {
  margin: 0 10px;
}
</style>
