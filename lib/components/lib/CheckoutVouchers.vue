<template>
    <div>
        <b-button v-if="!show" type="is-primary" @click="show = true">
            {{ $t('add-voucher') }}
        </b-button>
        <form v-if="show" @submit.prevent="handleVoucher">
            <b-field :message="error ? error.errorMessage : null" :type="error ? 'is-danger' : null">
                <b-input placeholder="Enter Voucher, Coupon, or Promo Code" expanded v-model="voucherCode" @focus="clearError" />
                <b-button type="is-primary" native-type="submit" :loading="loading" :disabled="!voucherCode">
                    {{ $t('apply') }}
                </b-button>
            </b-field>
        </form>

        <table class="table is-striped is-fullwidth">
            <tr v-for="voucher of vouchers" :key="voucher">
                <td>
                    {{voucher}}
                </td>
                <td class="has-text-right">
                    <button class="delete" role="button" @click="removeVoucher(voucher)">
                        {{ $t('remove-voucher') }}
                    </button>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
export default {
    name: 'CheckoutVouchers',
    props: {
        vouchers: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            voucherCode: '',
            error: null,
            loading: false,
            show: false
        }
    },
    methods: {
        clearError() {
            this.voucherCode = ''
            this.error = null
        },
        removeVoucher(voucher) {
            this.$emit('update:vouchers', this.vouchers.filter(v => v !== voucher.toUpperCase()))
        },
        async handleVoucher(event) {
            this.loading = true
            const { voucher, requestStatus } = await this.$rezdy.getVoucher(this.voucherCode)
            this.loading = false
            if (voucher) {
                this.$emit('update:vouchers', [...this.vouchers.filter(v => v !== this.voucherCode.toUpperCase()), this.voucherCode.toUpperCase()])
                this.error = null
                this.voucherCode = ''
                return
            }
            this.error = requestStatus.error
        }
    }
}
</script>