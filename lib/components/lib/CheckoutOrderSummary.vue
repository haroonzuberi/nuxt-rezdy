<template>
    <table class="order-summary-table table is-small is-fullwidth">
        <tr>
            <th>Items</th>
            <td>{{ productTotal | currency($i18n.locale, currency) }}</td>
        </tr>
        <tr v-if="extrasTotal">
            <th>Extras</th>
            <td>{{ extrasTotal | currency($i18n.locale, currency) }}</td>
        </tr>
        <tr v-if="taxesAndFees">
            <th>Total before taxes and fees</th>
            <td>{{ (totalAmount - taxesAndFees)  | currency($i18n.locale, currency) }}</td>
        </tr>
        <tr v-if="taxesAndFees">
            <th>Taxes and fees</th>
            <td>{{ taxesAndFees | currency($i18n.locale, currency) }}</td>
        </tr>
        <tr>
            <th>Order Total</th>
            <td>{{ totalAmount | currency($i18n.locale, currency) }}</td>
        </tr>
        <tr v-if="totalPaid">
            <th>Coupons, Vouchers, and Promo Codes</th>
            <td>- {{ totalPaid | currency($i18n.locale, currency) }}</td>
        </tr>
        <tr class="total-due">
            <th>Total Due</th>
            <td>{{ totalDue | currency($i18n.locale, currency) }}</td>
        </tr>
    </table>
</template>

<script>
export default {
    name: 'CheckoutOrderSummary',
    props: {
        quantities: {
            type: Array,
            default: () => []
        },
        extras: {
            type: Array,
            default: () => []
        },
        totalAmount: {
            type: Number,
            default: 0
        },
        taxesAndFees: {
            type: Number,
            default: 0
        },
        totalPaid: {
            type: Number,
            default: 0
        },
        totalDue: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'EUR'
        }
    },
    computed: {
        extrasTotal() {
            return this.extras.reduce(
                (total, extra) => total + extra.quantity * extra.price * (extra.extraPriceType === 'QUANTITY' ? this.totalQuantity : 1),
                0
            )
        },
        productTotal() {
            return this.quantities.reduce(
                (total, quantity) => total + quantity.value * quantity.optionPrice,
                0
            )
        }
    }
}
</script>

<style scoped>


td:last-child {
    text-align: right;
}

.total-due {
    font-size: 120%;
    font-weight: bold;
}

.total-due td, .total-due th {
    border-bottom-color: transparent;
}
</style>