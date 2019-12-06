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
        <b-collapse :open.sync="expanded" aria-id="optionalParticipantFields" v-if="!hideOptional">
            <div class="columns is-multiline">
                <checkout-field-input
                    class="column"
                    v-for="(field, f) of optionalFields" :key="f"
                    ref="field"
                    @update="updateField(field, $event)"
                    :field="field"
                />
            </div>
            <button v-show="!expanded" class="button is-text is-pulled-right" slot="trigger" aria-controls="optionalParticipantFields">
                Add additional detail
            </button>
        </b-collapse>
    </form>
</template>

<script>
import CheckoutFieldInput from './CheckoutFieldInput.vue'
export default {
    name: 'CheckoutParticipantFields',
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
            expanded: false
        }
    },
    computed: {
        requiredFields() {
            return this.participantFields.filter(field => field.requiredPerParticipant)
        },
        optionalFields() {
            return this.participantFields.filter(field => !field.requiredPerParticipant)
        },
        participantFields() {
            if(!this.product) return []
            return this.product.bookingFields
                .filter(field => field.visiblePerParticipant)
                .filter(field => !(this.hideOptional && !field.requiredPerParticipant))
                .sort((a, b) => {
                    // Put required fields first
                    return a.requiredPerParticipant && b.requiredPerParticipant
                        ? 0
                        : a.requiredPerParticipant
                        ? -1
                        : 1;
                })
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
</style>