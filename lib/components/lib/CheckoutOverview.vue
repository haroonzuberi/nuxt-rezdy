<template>
    <div class="level">
        <div class="level-left">
            <div class="level-item">
                <div>
                    <p class="overview-product title is-4 has-text-left-tablet is-spaced">
                        {{product.name}}
                    </p>
                    <p class="overview-price subtitle is-5 has-text-left-tablet">
                        {{$t('from')}}
                        {{ product.advertisedPrice | currency($i18n.locale, product.currency) }} 
                        |
                        
                        {{ product.durationMinutes | durationInWords($t('hours'), $t('minutes')) }}
                    </p>
                    <!-- <div v-for="guest of guests" :key="guest.optionId">
                        {{ guest.value }}x {{ guest.optionLabel }}
                    </div>
                    <div v-for="extra of extras" :key="extra.name">
                        {{ extra.quantity}}x {{ extra.extraPriceType }} {{ extra.name}}
                    </div> -->
                </div>
            </div>
        </div>
        <div class="level-right">
            <div v-if="session" class="level-item">
                <div>
                    <p class="overview-date title is-5 is-spaced">{{session.startTimeLocal | formatDateLocale("PPPP", $i18n.locale) }}</p>
                    <p class="overview-time subtitle is-4 has-text-right-tablet" v-if="showTime">{{session.startTimeLocal | formatDateLocale("p", $i18n.locale) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { parseISO } from 'date-fns'
import locale from '../../mixins/locale'

export default {
    name: 'CheckoutOverview',
    mixins: [locale],
    filters: {
        durationInWords(minutes, hourFormat, minFormat) {
            const h = Math.floor(minutes/60)
            const hwords = h ? `${h} ${hourFormat || 'hours'} ` : ''
            const m = minutes % 60
            const mwords = m ? `${m} ${minFormat || 'minutes'}` : ''
            return  hwords + mwords;
        }
    },
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
    },
    computed: {
        showTime() {
            const time = parseISO(this.session.startTimeLocal)
            const isMidnight = time.getHours() + time.getMinutes() + time.getSeconds() === 0
            return !isMidnight
        }
    }
}
</script>

<style scoped>
.title, .subtitle{
    line-height: 1.1;
    margin: 0;
}

@media only screen and (max-width: 600px) {
  .overview-product {
    font-size: 1.5rem;
  }
  .overview-price {
      display: none;
  }
}
</style>