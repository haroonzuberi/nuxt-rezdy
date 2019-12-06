<template>
    <b-field :label="option.label" :message="!(optionMaxQuantity - optionValue) ? 'Nothing left' : null">
        <b-numberinput
            :min="min"
            :max="optionMaxQuantity"
            v-model="optionValue"
        />
    </b-field>
</template>

<script>
export default {
    name: 'CheckoutPricingOption',
    props: {
        option: {
            type: Object,
            default: () => null
        },
        session: {
            type: Object,
            default: () => null
        },
        guests: {
            type: Array,
            default: () => []
        },
        groupOption: {
            type: Boolean,
            default: false
        },
        max: {
            type: Number,
            default: Infinity
        },
        min: {
            type: Number,
            default: 0
        },
        totalGuests: {
            type: Number,
            default: 0
        }
    },
    computed: {
        optionValue: {
            get() {
                const guest = this.guests.find(v => v.optionId === this.option.id);
                return guest ? +guest.value : 0
            },
            set(value) {
                this.$emit('input', value)
            }
        },
        optionMinQuantity() {
            return this.groupOption ? Math.min(...groupOptions.map(option => option.minQuantity)) : 0
        },
        optionMaxQuantity() {
            const { seats, seatsAvailable } = this.session;
            // TODO: need to ignore booked sessions for global picker
            const available = this.ignoreAvailability
                ? this.max
                : Math.min(
                    seats || Infinity,
                    seatsAvailable,
                    this.max
                );
            const current = this.guests.find(guest => this.option.id === guest.optionId);
            const currentValue =
                (current ? +current.value : 0) * (this.option.seatsUsed || 1);
            const max = available - (available % this.option.seatsUsed) - this.totalGuests + currentValue

            return this.groupOption ? max : Math.floor(max / this.option.seatsUsed)
        }
    }
}
</script>