<template>
  <b-field
    :label="type === 'Boolean' ? null : $t(field.label)"
    :class="[{ 'is-required': required }, widthClass]"
    :label-position="type === 'Boolean' ? null : 'inside'"
  >
    <b-input
      v-if="type === 'String'"
      v-model="updatedValue"
      :type="field.label === 'Email' ? 'email' : 'text'"
      :icon="icon"
      :required="required"
    />
    <b-input
      v-else-if="type === 'Textarea'"
      v-model="updatedValue"
      type="input"
      :icon="icon"
      :required="required"
    />
    <div v-else-if="type === 'Phone'" class="control">
      <vue-tel-input
        v-model="updatedValue"
        :required="required"
        wrapper-classes="input"
        dynamic-placeholder
        mode="international"
        @input="validatePhoneNumber"
        :class="!valid? 'is-danger': ''"
      ></vue-tel-input>
      <p v-if="updatedValue != '' && !valid" class="help is-danger">Please fill out a valid Phone Number.</p>
    </div>
    <birthdate-input
      v-else-if="type === 'Birthdate'"
      v-model="updatedValue"
      :icon="icon"
      :required="required"
    />
    <b-select
      v-else-if="type === 'Attribution'"
      v-model="updatedValue"
      :icon="icon"
      :required="required"
      :placeholder="$t('select') + '…'"
      expanded
    >
      <option value="Internet search">{{ $t('Internet search') }}</option>
      <option value="Friend">{{ $t('Friend') }}</option>
      <option value="Social Media">{{ $t('Social Media') }}</option>
      <option value="Coupon website">{{ $t('Coupon website') }}</option>
      <option value="Gift card">{{ $t('Gift card') }}</option>
      <option value="Brochure">{{ $t('Brochure') }}</option>
      <option value="Signage">{{ $t('Signage') }}</option>
      <option value="TV">{{ $t('TV') }}</option>
      <option value="Radio">{{ $t('Radio') }}</option>
      <option value="Press">{{ $t('Press') }}</option>
      <option value="Flyer">{{ $t('Flyer') }}</option>
      <option value="Agent">{{ $t('Agent') }}</option>
      <option value="Other">{{ $t('Other') }}</option>
    </b-select>
    <b-select
      v-else-if="type === 'Language'"
      v-model="updatedValue"
      :icon="icon"
      :required="required"
      :placeholder="$t('select') + '…'"
      expanded
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="es">Español</option>
      <option value="pt">Português</option>
      <option value="de">Deutsch</option>
      <option value="it">Italiano</option>
      <option value="zh">中文</option>
      <option value="sv">Svenska</option>
      <option value="nb">Norsk bokmål</option>
      <option value="ru">русский</option>
      <option value="da">Dansk</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
      <option value="ro">Română</option>
      <option value="tr">Türkçe</option>
      <option value="fi">Suomi</option>
      <option value="sk">Slovenčina</option>
    </b-select>
    <b-select
      v-else-if="type === 'List'"
      v-model="updatedValue"
      :icon="icon"
      :required="required"
      :placeholder="$t('select') + '…'"
      expanded
    >
      <option
        v-for="(option, idx) of parseListOptions(
          field.listOptions,
          field.label
        )"
        :key="idx"
        :value="option.value || option"
      >
        {{ option.name || option }}
      </option>
    </b-select>
    <b-switch
      v-else-if="type === 'Boolean'"
      v-model="updatedValue"
      :required="required"
      :true-value="1"
      :false-value="0"
    >
      {{ $t(field.label) }}
    </b-switch>
    <b-datepicker
      v-else-if="type === 'Date'"
      v-model="updatedValue"
      :required="required"
      :month-names="monthNames"
      icon="calendar"
      :max-date="maxDate"
    />
    <div v-else>UNKNOWN FIELD TYPE: {{ type }}</div>
  </b-field>
</template>

<i18n src="./lang.json"></i18n>

<script>
import BirthdateInput from './BirthdateInput.vue'
export default {
  components: {
    BirthdateInput
  },
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    required: {
      type: Boolean,
      default: false
    },
    value: {
      type: [Boolean, Number, String, Date],
      default: null
    }
  },
  data() {
    return {
      valid: false
    }
  },
  computed: {
    maxDate() {
      return this.field.label.toLowerCase() === 'date of birth'
        ? new Date()
        : null
    },
    monthNames() {
      return Object.values(this.$t('months'))
    },
    type() {
      switch (this.field.label) {
        case 'Date of Birth':
        case 'Date of birth':
          return 'Birthdate'
        case 'Special Requirements':
          return 'Textarea'
        case 'Preferred Language':
          return 'Language'
        case 'How did you hear about us?':
          return 'Attribution'
      }
      return this.field.fieldType
    },
    icon() {
      switch (this.field.label) {
        case 'Birthdate':
          return 'calendar'
        case 'Email':
          return 'envelope'
        case 'First Name':
        case 'Last Name':
          return 'user'
        case 'Preferred Language':
          return 'language'
      }
      return null
    },
    widthClass() {
      return [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Mobile',
        'Date',
        'List',
        'Birthdate',
        'City',
        'State/County/Region',
        'Postcode/ZIP'
      ].some(label => this.field.label === label || this.type === label)
        ? 'is-half'
        : 'is-full'
    },
    updatedValue: {
      get() {
        // Need to force strings on boolean return due to accepting Boolean values as props
        if (
          this.field.fieldType !== 'Boolean' &&
          typeof this.value === 'boolean'
        ) {
          return ''
        }

        /* if (
          this.field.fieldType !== "Date"
        ) {
          return format(this.value);
        } */

        if (this.field.fieldType === 'List' && this.field.label === 'Country') {
          const { localization } = this.$rezdy
          return (
            this.value ||
            (localization && localization.defaultCountry
              ? localization.defaultCountry
              : 'UK')
          )
        }
        return this.value
      },
      set(val) {
        this.$emit('update', val)
      }
    }
  },
  methods: {
    parseListOptions(items, type) {
      // rezdy uses line breaks to separate list items!  joy.
      if (type === 'Country') {
        const countries = this.$rezdy.countries
          .map(c => ({
            name: c.name,
            value: c.alpha2Code
          }))
          .sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase()
              ? 1
              : a.name.toLowerCase() < b.name.toLowerCase()
              ? -1
              : 0
          )

        if (
          this.$rezdy.localization &&
          this.$rezdy.localization.defaultCountry
        ) {
          const { defaultCountry } = this.$rezdy.localization
          return [
            countries.find(c => c.value === defaultCountry),
            ...countries.filter(c => c.value !== defaultCountry)
          ]
        }
        return countries
      }

      if (type === 'Title')
        return [
          { name: 'Mr.', value: 'MR' },
          { name: 'Ms.', value: 'MS' },
          { name: 'Mrs.', value: 'MRSS' },
          { name: 'Miss', value: 'MISS' }
        ]
      if (type === 'Gender')
        return [
          { name: 'Male', value: 'MALE' },
          { name: 'Female', value: 'FEMALE' }
        ]
      if (!items) return []
      return items.split(/\r\n|\r|\n/g)
    },
    validatePhoneNumber: function (value, { number, isValid, country }) {
      this.valid = isValid;
    },

  },
  watch: {
    updatedValue(value){
      // binding this to the data value in the email input
      this.updatedValue = value;
      if(this.type === 'Phone'){
        this.validatePhoneNumber(value);

      }
    }
  },

}
</script>

<style scoped>
.vue-tel-input::v-deep input {
  background-color: transparent;
}
.vue-tel-input:focus-within {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 0 rgba(189, 189, 189, 0.25);
}
.field::v-deep .control-label {
  color: var(--dark);
}
</style>
