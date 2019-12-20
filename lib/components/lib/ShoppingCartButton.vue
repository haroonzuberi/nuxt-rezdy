<template>
    <div class="shopping-cart-button" @click="openCheckout">
        <fa-layers class="fa-fw fa-2x">
            <fa-icon :icon="['fas', 'shopping-cart']" />
            <fa-layers class="fa-lg fa-layers-counter fa-layers-top-right" style="line-height: inherit">
                {{ count }}
            </fa-layers>
        </fa-layers>
    </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapActions, mapState } = createNamespacedHelpers('rezdy/booking')
export default {
    name: 'RezdyShoppingCartButton',
    computed: {
        ...mapState({
            count: state => state.booking.items.length
        })
    },
    methods: {
        openCheckout() {
            this.$rezdy.checkout(this)
        }
    }
}

</script>