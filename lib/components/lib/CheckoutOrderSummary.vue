<template>
  <div v-if="booking">
    <table class="order-summary-table table is-small is-fullwidth">
      <template v-for="item of booking.items">
        <tr
          class="rezdy-order-item"
          :key="'item-' + item.productCode + item.startTimeLocal"
        >
          <th>
            <h3 class="title is-5 has-text-left is-marginless">
              {{ item.productName }}
            </h3>
            <p>{{ item.startTimeLocal }}</p>
          </th>
          <td
            class="rezdy-order-item-amount"
            :colspan="isConfirmation ? 2 : null"
          >
            {{ item.subtotal | currency($i18n.locale, currency) }}
          </td>
          <td class="rezdy-order-item-remove" v-if="!isConfirmation">
            <button class="delete" @click="removeCheckoutItem(item)">
              Remove
            </button>
          </td>
        </tr>
        <tr
          class="rezdy-order-item-details"
          :key="'details-' + item.productCode + item.startTimeLocal"
        >
          <td colspan="3">
            <ul class="rezdy-order-quantities">
              <li
                v-for="quantity of item.quantities"
                :key="
                  'quantities-' +
                    item.productCode +
                    item.startTimeLocal +
                    quantity.optionLabel
                "
              >
                {{ quantity.value }} × {{ quantity.optionLabel }}
              </li>
            </ul>
            <ul class="rezdy-order-extras">
              <li
                v-for="extra of item.extras"
                :key="
                  'extras-' +
                    item.productCode +
                    item.startTimeLocal +
                    extra.name
                "
              >
                {{ extra.quantity }} × {{ extra.name }}
              </li>
            </ul>
          </td>
        </tr>
      </template>
      <tr v-if="taxesAndFees">
        <th>{{ $t('summary-pre-tax') }}</th>
        <td colspan="2">
          {{
            (booking.totalAmount - taxesAndFees)
              | currency($i18n.locale, currency)
          }}
        </td>
      </tr>
      <tr v-if="taxesAndFees">
        <th>{{ $t('summary-taxes') }}</th>
        <td colspan="2">{{ taxesAndFees | currency($i18n.locale, currency) }}</td>
      </tr>
      <tr v-if="booking.totalAmount !== booking.totalDue">
        <th>{{ $t('summary-order-total') }}</th>
        <td colspan="2">
          {{ booking.totalAmount | currency($i18n.locale, currency) }}
        </td>
      </tr>
      <tr v-if="voucherTotal">
        <th>{{ $t('summary-vouchers') }}</th>
        <td colspan="2" style="white-space: nowrap">
          - {{ voucherTotal | currency($i18n.locale, currency) }}
        </td>
      </tr>
      <tr v-if="!isConfirmation">
        <td colspan="3" style="padding:0; border: none;">
          <checkout-vouchers />
        </td>
      </tr>
      <tr class="total-due">
        <th>
          {{ isConfirmation ? $t('summary-total') : $t('summary-total-due') }}
        </th>
        <td colspan="2">{{ total | currency($i18n.locale, currency) }}</td>
      </tr>
    </table>
  </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions, mapState } = createNamespacedHelpers('rezdy/booking')
import CheckoutVouchers from './CheckoutVouchers.vue'
export default {
  name: 'CheckoutOrderSummary',
  components: {
    CheckoutVouchers
  },
  props: {
    isConfirmation: {
      type: Boolean,
      default: false
    },
    booking: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    currency() {
      return this.booking.totalCurrency || 'EUR'
    },
    ...mapState({
      loading: state => state.loading.quote || false
    }),
    taxesAndFees() {
      if (!this.booking) return
      return (this.booking.items || []).reduce(
        (total, item) => total + (item.totalItemTax || 0),
        0
      )
    },
    voucherTotal() {
      if (this.isConfirmation) {
        return this.booking.payments
          .filter(p => p.type !== 'CREDITCARD')
          .reduce((total, payment) => total + payment.amount, 0)
      }
      return this.booking.totalPaid
    },
    total() {
      if (this.isConfirmation) {
        return this.booking.payments
          .filter(p => p.type === 'CREDITCARD')
          .reduce((total, payment) => total + payment.amount, 0)
      }
      return this.booking.totalDue
    }
  },
  methods: {
    ...mapActions(['removeItem']),
    removeCheckoutItem(item) {
      this.$ecommerce.trackCheckoutRemove({ item })
      this.removeItem({ item })
    }
  }
}
</script>

<style scoped>
.rezdy-order-item-amount,
td:last-child:not(:first-child) {
  text-align: right;
}

.rezdy-order-item-remove {
  max-width: 1rem;
}

.total-due {
  font-size: 133%;
  font-weight: bold;
}

.total-due td,
.total-due th {
  border-bottom-color: transparent;
}

.rezdy-order-item th,
.rezdy-order-item td {
  border-bottom: none;
  padding-bottom: 0;
}

.rezdy-order-item-details td {
  padding-top: 0;
  font-size: 0.85rem;
  text-align: left;
}
</style>
