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
    <div
      v-if="locations.length > 1 && locations.length < 6"
      class="pickup-locations columns is-multiline"
    >
      <div
        v-for="(location, l) of locations"
        :key="l"
        class="pickup-location radio-button column"
      >
        <input
          :id="'product-location-' + l"
          name="location"
          type="radio"
          :value="location"
          @input="$emit('update:selected', location)"
        />
        <label
          :for="'product-location-' + l"
          class="button is-fullwidth is-primary"
          :class="{ 'is-outlined': selected !== location }"
        >
          <p class="location-option">{{ ['A', 'B', 'C', 'D', 'E'][l] }}</p>
          <p class="location-name">{{ location.locationName }}</p>
          <p class="location-address is-family-sans-serif	">
            {{ location.address }}
          </p>
        </label>
      </div>
    </div>
    <div v-else class="pickup-locations">
      <div v-if="selected" class="section">
        <button class="delete is-pulled-right" @click="$emit('update:selected')">Change Location</button>
        <h6 class="title is-4 is-marginless">
         <span class="has-text-success">✓</span> {{ selected.locationName }}
        </h6>
        <address v-if="selected.address" class="has-text-centered">
          {{ selected.address }}
        </address>
      </div>
      <b-select v-else @input="(l) => $emit('update:selected', locations[l])" size="is-medium" icon="map-marked" expanded>
        <option v-for="(location, l) of locations" :key="l" :value="l">{{location.locationName}}</option>
      </b-select>
    </div>
    <b-message
      v-if="selected && selected.minutesPrior"
      class="pickup-instructions"
      type="is-warning"
      has-icon
    >
      <div class="content">
        <p v-if="selected.minutesPrior" class="location-minutes-prior">
          <strong
            >Please arrive {{ selected.minutesPrior }} minutes before scheduled
            tour time.</strong
          >
        </p>
      </div>
    </b-message>
    <b-message  v-if="selected && selected.additionalInstructions" class="pickup-instructions" type="is-info" has-icon>
      <div class="content">
        <div
          class="location-instructions"
          v-html="selected.additionalInstructions"
        />
      </div>
    </b-message>
  </div>
</template>

<i18n src="./lang.json"></i18n>

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
.radio-button .button .location-name {
  font-size: 150%;
  margin-bottom: 4px;
}

.radio-button .button .location-address {
  font-size: 12px;
}

.message.pickup-instructions ::v-deep .media {
  display: flex;
  align-items: center;
}
</style>
