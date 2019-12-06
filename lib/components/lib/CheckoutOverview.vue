<template>
    <div class="content">
        <h1>
            {{product.name}}
        </h1>
        <span v-if="session">
            {{session.startTimeLocal}}
        </span>
        <div v-for="guest of guests" :key="guest.optionId">
            {{ guest.value }}x {{ guest.optionLabel }}
        </div>
        <div v-for="extra of extras" :key="extra.name">
            {{ extra.quantity}}x {{ extra.extraPriceType }} {{ extra.name}}
        </div>
    </div>
</template>
<script>
export default {
    name: 'CheckoutOverview',
    props: {
        product: {
            type: Object,
            default: () => {}
        },
        session: {
            type: Object,
            default: () => {}
        },
        guests: {
            type: Array,
            default: () => {}
        },
        participantFields: {
            type: Array,
            default: () => {}
        },
        bookingFields: {
            type: Array,
            default: () => {}
        },
        extras: {
            type: Array,
            default: () => {}
        }
    }
}
</script>