<template>
    <form @submit.prevent="submitPayment" v-if="quote">
        <label class="label">
            Payment Details
        </label>
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
                <b-select v-model="expMonth" icon="calendar" placeholder="MM" required>
                    <option v-for="m in 12" :key="m" :value="m">
                        {{ m }} — {{ $t('months')[m-1] }}
                    </option>
                </b-select>
                <b-select v-model="expYear" placeholder="YYYY" required>
                    <option v-for="y in 10" :key="y" :value="now.getFullYear() + y - 1">
                        {{ now.getFullYear() + y - 1 }}
                    </option>
                </b-select>
            </b-field>
            <b-field label="CVV" label-position="inside" style="flex-shrink: 1">
                <b-input
                    v-model="cvv"
                    icon="lock-alt"
                    :maxlength="4"
                    :has-counter="false"
                    required
                />
            </b-field>
        </b-field>

        <b-button type="is-success" native-type="submit" icon="lock-alt">
            {{$t('pay')}}
        </b-button>
    </form>
</template>

<i18n src="./lang.json"></i18n>

<script>
export default {
    name: 'CheckoutPayment',
    props: {
        quote: {
            type: Object,
            default: () => null
        },
        totalDue: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            ccNo: '',
            cvv: '',
            expMonth: null,
            expYear: null,
            now: new Date()
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
        submitPayment() {
            const checkout = {
                ...this.quote,
                payments: {
                    type: 'CREDITCARD',
                    amount: this.totalDue,
                    date: (new Date()).toISOString(), // TODO: this would be best done on server!
                    label: 'Payment processed by 2Checkout' // TODO: this would be best done on server!
                }
            }
            console.log('checkout', checkout)
            this.createToken()
            // const { booking } = await this.$rezdy.checkout(checkout)
        },
        async createToken() {
            if (process.client) {
                const { TCO } = window;
                const { ccNo, cvv, expMonth, expYear } = this;
                const { sellerId, publishableKey } = this.$rezdy.checkoutOptions
                // This will vary depending on provider
                const params = {
                    sellerId,
                    publishableKey,
                    ccNo,
                    cvv,
                    expMonth,
                    expYear
                }
                const test = await this.requestToken(params)
                console.log('response', test);
            }
        },
        requestToken(params) {
            const mode = process.env.NODE_ENV !== 'development' ? 'production' : 'sandbox'
            return new Promise((resolve, reject) => {
                TCO.loadPubKey(mode, function() {
                    console.log('mode', mode)
                    console.log(params);
                    TCO.requestToken(resolve, reject, params)
                })
            })    
        }
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