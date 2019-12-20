<template>
    <div class="shopping-cart-button" @click="openCheckout">
        <fa-layers full-width class="fa-lg">
            <fa-icon icon="shopping-cart" />
            <fa-layers-text counter :value="count" position="top-right" v-if="count > 0"/>
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

<style scoped>
.shopping-cart-button {
    cursor: pointer
}
.fa-shopping-cart {
    margin-right: 0 !important;
}
.fa-layers-counter {
    transform-origin: 163% -45%;
    transform: scale(0.6);
}
</style>