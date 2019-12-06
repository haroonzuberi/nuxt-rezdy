<template>
    <transition-group name="participants" tag="div">
        <div v-for="(n, i) in totalGuests" :key="n" class="participant box">
            <h3>{{ product.unitLabel }} {{ n }}</h3>
            <checkout-participant-fields
                ref="participant"
                :product="product"
                :fields="participants[i]"
                @update:valid="checkValidity(i, $event)"
                @update:fields="updateFields(i, $event)"
            />
        </div>
    </transition-group>
</template>

<script>
import CheckoutParticipantFields from './CheckoutParticipantFields.vue'
export default {
    name: 'CheckoutParticipants',
    components: {
        CheckoutParticipantFields
    },
    props: {
        product: {
            type: Object,
            default: () => null
        },
        participants: {
            type: Array,
            default: () => []
        },
        totalGuests: {
            type: Number,
            default: 0
        }
    },
    methods: {
        checkValidity(guest, valid) {
            this.$emit(
                'update:valid',
                this.$refs.participant.reduce(
                    (valid, participant) => participant.$refs.form.checkValidity() && valid,
                    true
                )
            )
        },
        updateFields(index, fields) {
            const update = [
                ...(this.participants[index] || []).filter(field => !fields.some(f => f.label === field.label)),
                ...fields
            ];
            this.$emit('update:participants', [
                ...this.participants.slice(0, index),
                update,
                ...this.participants.slice(index+1)
            ])
        }
    }
}
</script>