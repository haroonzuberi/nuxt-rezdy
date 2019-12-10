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
        <b-collapse :open.sync="open" aria-id="optionalParticipantFields" v-if="!hideOptional">
            <div class="optional-fields-divider" :data-content="$t('optional')"></div>
            <div class="columns is-multiline">
                <checkout-field-input
                    class="column"
                    v-for="(field, f) of optionalFields" :key="f"
                    ref="field"
                    @update="updateField(field, $event)"
                    :field="field"
                />
            </div>
            <button v-show="!open" class="button is-text is-pulled-right" slot="trigger" aria-controls="optionalParticipantFields">
                {{ $t('add-detail') }}
            </button>
        </b-collapse>
    </form>
</template>

<i18n src="./lang.json"></i18n>

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
        open: {
            get() {
                return !this.hasRequiredFields || this.expanded
            },
            set(open) {
                this.expanded = open 
            }
        },
        hasRequiredFields() {
            return this.product.bookingFields.some(field => field.requiredPerParticipant)
        },
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

.column.is-floating-in-label::v-deep .label,
.column.is-floating-label::v-deep .label{
    margin: 0 10px;
}
.optional-fields-divider {
    display: block;
    position: relative;
    width: 100%;
    height: 2rem;
}
.optional-fields-divider:before {
    position: absolute;
    content: '';
    top: calc(50% - 1px);
    left: 0;
    height: 2px;
    width: 100%;
    background-color: var(--light);
}
.optional-fields-divider:after {
    position: absolute;
    content: attr(data-content);
    text-transform: uppercase;
    font-size: 90%;
    padding: 0.5em 1em;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: var(--dark);
    background-color: var(--white);
}
</style>