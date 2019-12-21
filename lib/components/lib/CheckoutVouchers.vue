<template>
    <div>
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
        <b-button v-if="!show" type="is-primary is-outlined" expanded @click="showVoucherInput">
            {{ $t('add-voucher') }}
        </b-button>
        <form v-if="show" @submit.prevent="handleVoucher">
            <b-field :message="error ? error.errorMessage : null" :type="error ? 'is-danger' : null">
                <b-input ref="voucherInput" :placeholder="$t('voucher-placeholder')" expanded v-model="voucherCode" @blur="handleBlur" />
                <b-button type="is-primary" native-type="submit" :loading="loading" :disabled="!voucherCode">
                    {{ $t('apply') }}
                </b-button>
            </b-field>
        </form>
    </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions, mapState } = createNamespacedHelpers('rezdy/booking')
export default {
    name: 'CheckoutVouchers',
    data() {
        return {
            voucherCode: '',
            error: null,
            loading: false,
            show: false
        }
    },
    computed: {
        ...mapState({
            vouchers: state => state.booking.vouchers
        })
    },
    methods: {
        ...mapActions(['addVoucher', 'removeVoucher']),
        clearError() {
            this.voucherCode = ''
            this.error = null
        },
        handleBlur() {
            if(this.voucherCode.length === 0) {
                this.show = false
            }
        },
        showVoucherInput() {
            this.show = true
            this.$nextTick(() => {
                this.$refs.voucherInput.focus()
            })
        },
        async handleVoucher(event) {
            this.loading = true
            const { voucher, requestStatus } = await this.$rezdy.getVoucher(this.voucherCode)
            this.loading = false
            if (voucher) {
                this.addVoucher(this.voucherCode)
                this.error = null
                this.voucherCode = ''
                this.show = false
                return
            }
            this.error = requestStatus.error
        }
    }
}
</script>