<template>
    <div>
        <table class="order-summary-table table is-small is-fullwidth">
            <template v-for="item of quote.items">
                <tr class="rezdy-order-item" :key="'item-' +item.productCode + item.startTimeLocal">
                    <th>
                        <h3 class="title is-5 has-text-left is-marginless">{{ item.productName }}</h3>
                        <p>{{ item.startTimeLocal }}</p>
                    </th>
                    <td class="rezdy-order-item-amount">{{ item.subtotal | currency($i18n.locale, currency) }}</td>
                    <td class="rezdy-order-item-remove"><button class="delete" @click="removeCheckoutItem(item)">Remove</button></td>
                </tr>
                <tr class="rezdy-order-item-details" :key="'details-' +item.productCode + item.startTimeLocal">
                    <td colspan="3">
                        <ul class="rezdy-order-quantities">
                            <li v-for="quantity of item.quantities" :key="'quantities-' +item.productCode + item.startTimeLocal + quantity.optionLabel">
                                {{ quantity.value }} × {{ quantity.optionLabel }}
                            </li>
                        </ul>
                        <ul class="rezdy-order-extras">
                            <li v-for="extra of item.extras" :key="'extras-' +item.productCode + item.startTimeLocal + extra.name">
                                {{ extra.quantity }} × {{ extra.name }}
                            </li>
                        </ul>
                    </td>
                </tr>
            </template>
            <tr v-if="taxesAndFees">
                <th>{{ $t('summary-pre-tax') }}</th>
                <td>{{ (quote.totalAmount - taxesAndFees) | currency($i18n.locale, currency) }}</td>
            </tr>
            <tr v-if="taxesAndFees">
                <th>{{ $t('summary-taxes') }}</th>
                <td>{{ taxesAndFees | currency($i18n.locale, currency) }}</td>
            </tr>
            <tr v-if="quote.totalAmount !== quote.totalDue">
                <th>{{ $t('summary-order-total') }}</th>
                <td colspan="2">{{ quote.totalAmount | currency($i18n.locale, currency) }}</td>
            </tr>
            <tr v-if="quote.totalPaid">
                <th>{{ $t('summary-vouchers') }}</th>
                <td colspan="2" style="white-space: nowrap">- {{ quote.totalPaid | currency($i18n.locale, currency) }}</td>
            </tr>
            <tr class="total-due">
                <th>{{ $t('summary-total-due') }}</th>
                <td colspan="2">{{ quote.totalDue | currency($i18n.locale, currency) }}</td>
            </tr>
        </table>
        <b-loading :is-full-page="false" :active="loading" />
    </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions, mapState } = createNamespacedHelpers('rezdy/booking')
export default {
    name: 'CheckoutOrderSummary',
    props: {
        currency: {
            type: String,
            default: 'EUR'
        }
    },
    computed: {
        ...mapState({
            quote: state => state.quote,
            loading: state => state.loading.quote || false
        }),
        taxesAndFees() {
            if(!this.quote) return
            return (this.quote.items || []).reduce((total, item) => total + (item.totalItemTax || 0), 0)
        }
    },
    methods: {
        ...mapActions(['removeItem']),
        removeCheckoutItem(item) {
            this.removeItem({ item })
        }
    }
}
</script>

<style scoped>

.rezdy-order-item-amount, td:last-child {
    text-align: right;
}

.rezdy-order-item-remove {
    max-width: 1rem;
}

.total-due {
    font-size: 120%;
    font-weight: bold;
}

.total-due td, .total-due th {
    border-bottom-color: transparent;
}

.rezdy-order-item th, .rezdy-order-item td {
    border-bottom: none;
    padding-bottom: 0;
}

.rezdy-order-item-details td {
    padding-top: 0;
    font-size: 0.85rem;
    text-align: left;
}
</style>