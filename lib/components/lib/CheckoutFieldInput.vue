<template>
  <b-field
    :label="$t(field.label)"
    :class="[{ 'is-required': required }, widthClass]"
  >
    <b-input
      v-if="type === 'String'"
      v-model="updatedValue"
      :type="field.label === 'Email' ? 'email' : 'text'"
      :icon="icon"
      :required="required"
    />
    <div class="control" v-else-if="type === 'Phone'">
      <vue-tel-input
        v-model="updatedValue"
        :required="required"
        wrapper-classes="input"
        dynamic-placeholder
      ></vue-tel-input>
    </div>
    <b-select
      v-else-if="type === 'Attribution'"
      v-model="updatedValue"
      :icon="icon"
      :required="required"
      placeholder="Select..."
    >
      <option value="Internet search">Internet search</option>
      <option value="Friend">Friend</option>
      <option value="Social Media">Social Media</option>
      <option value="Coupon website">Coupon website</option>
      <option value="Gift card">Gift card</option>
      <option value="Brochure">Brochure</option>
      <option value="Signage">Signage</option>
      <option value="TV">TV</option>
      <option value="Radio">Radio</option>
      <option value="Press">Press</option>
      <option value="Flyer">Flyer</option>
      <option value="Agent">Agent</option>
      <option value="Other">Other</option>
    </b-select>
    <b-select
      v-else-if="type === 'Language'"
      v-model="updatedValue"
      :icon="icon"
      :required="required"
      placeholder="Select a language"
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
      placeholder="Select..."
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
      :true-value="1"
      :false-value="0"
    />
    <b-datepicker
      v-else-if="type === 'Date'"
      v-model="updatedValue"
      :month-names="monthNames"
      icon="calendar"
    />
    <div v-else>UNKNOWN FIELD TYPE: {{ type }}</div>
  </b-field>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { format } from 'date-fns'
export default {
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
    };
  },
  computed: {
    monthNames() {
      return Object.values(this.$t('months'))
    },
    type() {
      switch (this.field.label) {
        case "Preferred Language":
          return "Language"
        case "How did you hear about us?":
          return "Attribution"
      }
      return this.field.fieldType;
    },
    icon() {
      switch (this.field.label) {
        case "Email":
          return "envelope";
        case "First Name":
        case "Last Name":
          return "user";
        case "Preferred Language":
          return "language";
      }
      return null;
    },
    widthClass() {
      return ["First Name", "Last Name", "Email", "Phone", "Mobile", "Date"].some(
        label => this.field.label === label || this.type === label
      )
        ? "is-half"
        : "is-full";
    },
    updatedValue: {
      get() {
        // Need to force strings on boolean return due to accepting Boolean values as props
        if (
          this.field.fieldType !== "Boolean" &&
          typeof this.value === "boolean"
        ) {
          return "";
        }

        /* if (
          this.field.fieldType !== "Date"
        ) {
          return format(this.value);
        } */

        if (this.field.fieldType === "List" && this.field.label === "Country") {
          return this.value || "UK";
        }
        return this.value;
      },
      set(val) {
        this.$emit("update", val);
      }
    }
  },
  methods: {
    parseListOptions(items, type) {
      // rezdy uses line breaks to separate list items!  joy.
      if (type === "Country")
        return this.$rezdy.countries.map(c => ({
          name: c.name,
          value: c.alpha2Code
        }));
      if (type === "Title")
        return [
          { name: "Mr.", value: "MR" },
          { name: "Ms.", value: "MS" },
          { name: "Mrs.", value: "MRSS" },
          { name: "Miss", value: "MISS" }
        ];
      return items.split(/\r\n|\r|\n/g);
    }
  }
};
</script>

<style scoped>
.is-required::v-deep .label {
  font-weight: bold;
}

.vue-tel-input:focus-within {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 0 rgba(189, 189, 189, 0.25);
}

</style>
