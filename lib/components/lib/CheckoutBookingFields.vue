<template>
    <form ref="form" @submit.prevent v-if="product">
        <div class="columns is-multiline">
            <checkout-field-input
                class="column"
                v-for="(field, f) of requiredFields" :key="f"
                ref="field"
                :field="field"
                @update="updateField(field, $event)"
                required
            />
        </div>
        <b-collapse :open.sync="expanded" aria-id="optionalFields" v-if="!hideOptional">
            <div class="columns is-multiline">
                <checkout-field-input
                    class="column"
                    v-for="(field, f) of optionalFields" :key="f"
                    ref="field"
                    @update="updateField(field, $event)"
                    :field="field"
                />
            </div>
            <button v-show="!expanded" class="button is-text is-pulled-right" slot="trigger" aria-controls="optionalFields">
                {{ $t('add-detail') }}
            </button>
        </b-collapse>
    </form>
</template>

<i18n src="./lang.json"></i18n>

<script>
import CheckoutFieldInput from './CheckoutFieldInput.vue'
export default {
    name: 'CheckoutBookingFields',
    components: {
        CheckoutFieldInput
    },
    props: {
        product: {
            type: Object,
            default: () => null
        },
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
            test: 'test'
        }
    },
    computed: {
        requiredFields() {
            return this.bookingFields.filter(field => field.requiredPerBooking)
        },
        optionalFields() {
            return this.bookingFields.filter(field => !field.requiredPerBooking)
        },
        bookingFields() {
            if(!this.product) return []
            return this.product.bookingFields
                .filter(field => field.visiblePerBooking)
                .sort((a, b) => {
                    // Put standard fields first
                    const standardFields = [...this.$rezdy.standardFields].reverse();
                    const aidx = standardFields.indexOf(a.label);
                    const bidx = standardFields.indexOf(b.label);
                    return aidx > bidx ? -1 : aidx < bidx ? 1 : 0;
                })
                .sort((a, b) => {
                    // Put required fields first
                    return a.requiredPerBooking && b.requiredPerBooking
                        ? 0
                        : a.requiredPerBooking
                        ? -1
                        : 1;
                })
                .filter(field => !(this.hideOptional && !field.requiredPerBooking));
        }
    },
    methods: {
        updateField(field, value) {
            const { label } = field;
            const update = { label, value }
            const fields = [...this.fields.filter(f => f.label !== label), update]
            this.$emit('update:fields', fields)
            this.$emit('update:valid', this.$refs.form.checkValidity())
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
.column.is-floating-label::v-deep .label{
    margin: 0 10px;
}
</style>