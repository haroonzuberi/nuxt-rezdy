<template>
    <b-field :label="label">
        <b-numberinput
            :min="0"
            v-if="extra.extraPriceType === 'ANY'"
            v-model="updatedValue"
            controls-position="compact"
            :type="updatedValue > 0 ? 'is-primary' : 'is-grey'"
        />
        <b-switch v-else v-model="updatedValue"  :true-value="1" :false-value="0" />
    </b-field>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            default: 0
        },
        extra: {
            type: Object,
            default: () => null
        },
        product: {
            type: Object,
            default: () => null
        }

    },
    computed: {
        label() {
            const { price, extraPriceType } = this.extra;
            const { unitLabel, currency } = this.product

            const formattedPrice = this.$options.filters.currency(price, this.$i18n.locale, currency)
            return extraPriceType === 'QUANTITY' ? `${formattedPrice} / ${unitLabel}` : formattedPrice
        },
        updatedValue: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
                this.$emit('update:option', val)
            }
        }
    }
}
</script>