<template>
  <ul v-if="product">
    <li v-for="(extra, e) of product.extras" :key="e">
      <div class="box">
        <article class="media">
          <figure class="media-left">
            <p class="image is-128x128">
              <img :src="extra.image.thumbnailUrl" :alt="extra.name" />
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <h3 class="extra-name">{{ extra.name }}</h3>
              <p class="extra-description">{{ extra.description | localeParse($i18n.locale) }}</p>
            </div>
          </div>
        </article>
        <div class="checkout-option">
          <checkout-extras-option
            :extra="extra"
            :product="product"
            :value="getValue(extra)"
            @update:option="updateOption(extra, $event)"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
import locale from '../../mixins/locale'
import CheckoutExtrasOption from './CheckoutExtrasOption.vue'

export default {
  name: 'CheckoutExtras',
  components: {
    CheckoutExtrasOption
  },
  mixins: [locale],
  props: {
    product: {
      type: Object,
      default: () => null
    },
    extras: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getValue(extra) {
      const option = this.extras.find(e => e.name === extra.name)
      return option ? option.quantity : 0
    },
    updateOption(extra, quantity) {
      const update = [
        ...(this.extras || []).filter(e => e.name !== extra.name),
        { ...extra, quantity }
      ]
        .filter(e => e.quantity > 0)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

      this.$emit('update:extras', update)
    }
  }
}
</script>

<style scoped>
.media .image {
  overflow: hidden;
}
.media .image img {
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

.extra-description {
  font-size: 14px;
  white-space: pre-wrap;
}

.checkout-option {
  flex: 0 0 175px;
  text-align: right;
}

.checkout-option::v-deep .label {
  font-size: 1.25rem;
  font-weight: bold;
}

@media only screen and (max-width: 600px) {
  .box,
  .media {
    flex-direction: column;
  }

  .media-left {
    margin: 0 auto;
  }

  .media-content {
    text-align: center;
    margin: 1rem 0;
  }

  .checkout-option {
    flex: 1 1 0;
  }
  .checkout-option > .field {
    display: flex;
    flex-direction: column-reverse;
  }

  .checkout-option > .field::v-deep > * {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .checkout-option > .field::v-deep > .label {
    margin-top: 0.66em;
  }
}
</style>
