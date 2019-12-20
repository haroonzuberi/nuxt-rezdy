<template>
    <div v-if="locations" class="product-pickup">
          <h5 v-if="locations.length > 1" class="title">
            Choose your pickup location
          </h5>
          <div v-else class="product-pickup-single">
            <h5 class="item-section-label">
              Pickup Location: {{ selected.locationName }}
            </h5>
            <address>
              {{ selected.address }}
            </address>
          </div>
          <div v-if="locations.length > 1" class="pickup-locations">
            <div v-for="(location, l) of locations" :key="l" class="pickup-location radio-button">
              <input
                :id="'product-location-'+l"
                name="location"
                type="radio"
                :value="location"
                @input="$emit('update:selected', location)"
              >
              <label :for="'product-location-'+l">
                <span class="location-option">{{ ['A','B','C','D','E'][l] }}</span>
                <span class="location-name">{{ location.locationName }}</span>
                <span class="location-address"> {{ location.address }}</span>
              </label>
            </div>
          </div>
          <div v-if="selected" class="pickup-instructions">
            <div class="location-instructions" v-html="selected.additionalInstructions" />
            <p v-if="selected.minutesPrior" class="location-minutes-prior">
              Please arrive {{ selected.minutesPrior }} minutes before scheduled tour time.
            </p>
          </div>
        </div>
</template>

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