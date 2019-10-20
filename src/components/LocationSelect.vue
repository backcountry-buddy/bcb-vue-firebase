<template>
  <div>
    <div class="flex justify-between items-start items-center mb-2">
      <label v-if="label" for="location" class="mb-2 italic font-light text-sm">
        {{ label }}
      </label>
      <button type="button" class="form-button" @click="resetSelection">
        Reset
      </button>
    </div>
    <div class="flex flex-col md:flex-row">
      <select
        v-model="selectedCountry"
        @change="selectLocation('country')"
        class="p-2 mb-2 md:mb-0 bg-gray-200 text-sm"
        name="country"
      >
        <option value>Select a country</option>
        <option v-for="country in countries" v-bind:key="country.id">{{
          country.name
        }}</option>
      </select>
      <select
        v-if="!!selectedCountry"
        v-model="selectedState"
        @change="selectLocation('state')"
        class="p-2 mb-2 md:ml-2 md:mb-0 bg-gray-200 text-sm"
        name="state"
      >
        <option value>Select a state</option>
        <option v-for="state in states" v-bind:key="state.id">
          {{ state.name }}</option
        >
      </select>
      <select
        v-if="!!selectedState"
        v-model="selectedRegion"
        @change="selectLocation('region')"
        class="p-2 mb-2 md:ml-2 md:mb-0 bg-gray-200 text-sm"
        name="region"
      >
        <option value>Select a region</option>
        <option v-for="region in regions" v-bind:key="region.id">{{
          region.name
        }}</option>
      </select>

      <select
        v-if="!!selectedRegion"
        v-model="selectedLocation"
        @change="selectLocation('location')"
        class="p-2 mb-2 md:ml-2 md:mb-0 bg-gray-200 text-sm"
        name="location"
      >
        <option value>Select a location</option>
        <option v-for="location in locations" v-bind:key="location.id">{{
          location.name
        }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';

const countries = db.collection('countries').orderBy('name');
const states = db.collection('states').orderBy('name');
const regions = db.collection('regions').orderBy('name');
const locations = db.collection('locations').orderBy('name');

export default {
  props: ['label', 'preSelected'],

  data: function() {
    return {
      selectedCountry: '',
      selectedState: '',
      selectedRegion: '',
      selectedLocation: '',

      countries: [],
      states: [],
      regions: [],
      locations: []
    };
  },

  created() {
    if (this.preSelected) {
      this.selectedCountry = this.preSelected.country || '';
      this.selectedState = this.preSelected.state || '';
      this.selectedRegion = this.preSelected.region || '';
      this.selectedLocation = this.preSelected.location || '';
    }
  },

  watch: {
    selectedCountry(country) {
      this.$bind('states', states.where('country', '==', country));
    },
    selectedState(state) {
      this.$bind(
        'regions',
        regions
          .where('country', '==', this.selectedCountry)
          .where('state', '==', state)
      );
    },
    selectedRegion(region) {
      this.$bind(
        'locations',
        locations
          .where('country', '==', this.selectedCountry)
          .where('state', '==', this.selectedState)
          .where('region', '==', region)
      );
    }
  },

  methods: {
    selectLocation(locationType) {
      if (locationType === 'country') {
        this.selectedState = '';
        this.selectedRegion = '';
        this.selectedLocation = '';
      }
      if (locationType === 'state') {
        this.selectedRegion = '';
        this.selectedLocation = '';
      }
      if (locationType === 'region') {
        this.selectedLocation = '';
      }
      const params = {};
      [
        'selectedCountry',
        'selectedState',
        'selectedRegion',
        'selectedLocation'
      ].forEach(prop => {
        if (this.$data[prop]) {
          const paramName = prop.slice(8).toLowerCase();
          params[paramName] = this.$data[prop];
        }
      });
      this.$emit('selectLocation', params);
    },
    resetSelection() {
      this.selectedCountry = '';
      this.selectedState = '';
      this.selectedRegion = '';
      this.selectedLocation = '';
      this.$emit('selectLocation', {});
    }
  },

  firestore: {
    countries
  }
};
</script>
