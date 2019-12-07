<template>
    <div class="level content">
        <div class="level-left">
            <h1>
                {{product.name}}
            </h1>
            <div v-for="guest of guests" :key="guest.optionId">
                {{ guest.value }}x {{ guest.optionLabel }}
            </div>
            <div v-for="extra of extras" :key="extra.name">
                {{ extra.quantity}}x {{ extra.extraPriceType }} {{ extra.name}}
            </div>
        </div>
        <div class="level-right">
            <div v-if="session">
                <p class="title is-5">{{session.startTimeLocal | formatDateLocale("PPPP", $i18n.locale) }}</p>
                <p class="subtitle is-4 has-text-right">{{session.startTimeLocal | formatDateLocale("p", $i18n.locale) }}</p>
            </div>
        </div>
    </div>
</template>

<script>

import locale from '../../mixins/locale'

export default {
    name: 'CheckoutOverview',
    mixins: [locale],
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