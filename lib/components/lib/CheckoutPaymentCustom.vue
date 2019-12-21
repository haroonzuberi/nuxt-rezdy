<template>
    <form @submit.prevent="submitPayment">
        <b-field :label="$t('card-name')" label-position="on-border">
            <b-input
                v-model="ccName" 
                icon="user"
                size="is-medium"
                :validation-message="$t('validation-name')"
                expanded
                required
            />
        </b-field>
        <b-field :label="$t('card-number')" label-position="on-border">
            <b-input
                v-model="ccNo" 
                pattern="[0-9]{13,16}"
                :icon="cardType"
                :icon-pack="cardType !== 'credit-card' ? 'fab' : null"
                minlength="13"
                size="is-medium"
                :validation-message="$t('validation-cc')"
                expanded
                required
            />
        </b-field>
        <b-field :label="$t('expiry-date')" label-position="inside" grouped>
            <b-field>
                <b-select v-model="expMonth" icon="calendar" :placeholder="$t('month-placeholder')" required>
                    <option v-for="m in 12" :key="m" :value="m">
                        {{ m }} — {{ $t('months')[m-1] }}
                    </option>
                </b-select>
                <b-select v-model="expYear" :placeholder="$t('year-placeholder')" required>
                    <option v-for="y in 10" :key="y" :value="now.getFullYear() + y - 1">
                        {{ now.getFullYear() + y - 1 }}
                    </option>
                </b-select>
            </b-field>
            <b-field label="CVV" label-position="inside" style="flex-shrink: 1">
                <b-input
                    v-model="cvv"
                    icon="lock"
                    :maxlength="4"
                    :has-counter="false"
                    required
                />
            </b-field>
        </b-field>
        <div class="payment-options">
            <b-button type="is-success" native-type="submit" icon="lock">
                {{$t('pay')}}
            </b-button>
        </div>
        <b-loading :active.sync="processing" :is-full-page="false" />
    </form>
</template>

<i18n src="./lang.json"></i18n>

<script>
export default {
    name: 'CheckoutPayment',
    data() {
        return {
            ccName: '',
            ccNo: '4000000000000002',
            cvv: '123',
            expMonth: '11',
            expYear: '2021',
            now: new Date(),
            processing: false
        }
    },
    computed: {
        cardType() {
            const cardNumber = this.ccNo
            if (cardNumber) {
                if (cardNumber.search(/^4/) > -1) {
                    return 'cc-visa';
                }
                if (cardNumber.search(/^5[1-5]/) > -1) {
                    return 'cc-mastercard';
                }
                if (cardNumber.search(/^3[47]/) > -1) {
                    return 'cc-amex';
                }
                if (
                    cardNumber.search(
                        /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/
                    ) > -1
                ) {
                    return 'cc-discover';
                }
                if (cardNumber.search(/^(?:2131|1800|35\d{3})\d{11}$/) > -1) {
                    return 'cc-jcb';
                }
            }
            return 'credit-card';
        }
    },
    methods: {
        async submitPayment() {
            const { ccNo, cvv, expMonth, expYear } = this;
            const data = {
                payments: {
                    type: 'CREDITCARD',
                    amount: this.totalDue,
                    date: (new Date()).toISOString(), // TODO: this would be best done on server!
                    label: 'Payment processed by 2Checkout' // TODO: this would be best done on server!
                },
                creditCard: {
                    ccName,
                    ccNo,
                    cvv,
                    expMonth,
                    expYear
                }
            }

            this.processing = true

            const {error, checkout, booking } = await this.$rezdy.pay(data)

            if(error) {
                this.$buefy.toast.open({
                    message: error.errorMsg,
                    type: 'is-danger'
                })
            } else {
                this.$buefy.toast.open({
                    message: 'Payment success!',
                    type: 'is-success'
                })
            }

            this.processing = false
        }
    },
    mounted() {
        console.log('MOUNTED')
    },
    head() {
        return {
            script: [
                {
                    hid: '2checkout',
                    src: 'https://www.2checkout.com/checkout/api/2co.min.js',
                    type: 'text/javascript'
                }
            ]
        }
    }
}
</script>