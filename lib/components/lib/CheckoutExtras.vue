<template>
    <ul v-if="product" class="columnsx is-multiline">
        <li v-for="(extra, e) of product.extras" :key="e" class="columnx is-half">
            <div class="box">
                <article class="media">
                    <figure class="media-left">
                        <p class="image is-128x128">
                            <img :src="extra.image.thumbnailUrl" :alt="extra.name" />
                        </p>
                    </figure>
                    <div class="media-content">
                        <div class="content">
                            <h3>{{extra.name}}</h3>
                            <small>{{ extra.description }}</small>
                        </div>
                    </div>
                </article>
                <div class="checkout-option">
                    <checkout-extras-option :extra="extra" :product="product" />
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
import CheckoutExtrasOption from './CheckoutExtrasOption.vue'

export default {
    name: 'CheckoutExtras',
    components: {
        CheckoutExtrasOption
    },
    props: {
        product: {
            type: Object,
            default: () => null
        }
    }
}
</script>

<style scoped>

.media .image {
    overflow: hidden;
}
.media .image img{
    object-fit: cover;
    object-position: center;
    width: 100%;
    height: 100%;
}

.box {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
}

.checkout-option {
    flex: 0 0 175px;
    text-align: right;
}

.checkout-option::v-deep .label {
    font-size: 1.25rem;
    font-weight: bold;
}

</style>