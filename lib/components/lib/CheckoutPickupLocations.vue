<template>
    <div v-if="locations" class="product-pickup">
          <h5 v-if="locations.length > 1" class="title">
            {{ $t('choose-pickup') }}
          </h5>
          <div v-else class="product-pickup-single">
            <h5 class="item-section-label">
              Pickup Location: {{ selected.locationName }}
            </h5>
            <address>
              {{ selected.address }}
            </address>
          </div>
          <div v-if="locations.length > 1" class="pickup-locations columns">
            <div v-for="(location, l) of locations" :key="l" class="pickup-location radio-button column">
              <input
                :id="'product-location-'+l"
                name="location"
                type="radio"
                :value="location"
                @input="$emit('update:selected', location)"
              >
              <label :for="'product-location-'+l" class="button is-fullwidth is-primary" :class="{'is-outlined': selected !== location}">
                <p class="location-option">{{ ['A','B','C','D','E'][l] }}</p>
                <p class="location-name">{{ location.locationName }}</p>
                <p class="location-address is-family-sans-serif	"> {{ location.address }}</p>
              </label>
            </div>
          </div>
          <div v-if="selected && selected.minutesPrior" class="pickup-instructions message is-warning">
                <div class="message-body content">
                    <p v-if="selected.minutesPrior" class="location-minutes-prior">
                        <strong>Please arrive {{ selected.minutesPrior }} minutes before scheduled tour time.</strong>
                    </p>
                </div>
          </div>
          <div v-if="selected" class="pickup-instructions message is-small">
                <div class="message-body content">
                    <div class="location-instructions" v-html="selected.additionalInstructions" />
                </div>
          </div>
        </div>
</template>

<i18n src="./lang.json" ></i18n>

<script>
export default {
    name: 'CheckoutPickupLocations',
    props: {
        locations: {
            type: Array,
            default: () => []
        },
        selected: {
            type: Object,
            default: () => null
        }
    }
}
</script>

<style scoped>
.radio-button [type='radio'] {
    display: none;
}
.radio-button .button {
    height: auto;
    padding: 1.5rem;
    display: inline-block;
    white-space: normal;
}
.radio-button .button .location-name{
    font-size: 150%;
    margin-bottom: 4px;
}

.radio-button .button .location-address{
    font-size: 12px;
}
</style>