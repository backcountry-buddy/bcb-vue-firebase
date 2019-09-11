<template>
  <div>
    <label v-if="label" for="location" class="mb-2 italic font-light text-sm">
      {{ label }}
    </label>
    <div class="flex justify-between items-center">
      <div>
        <select
          v-model="selection.country"
          @change="selectLocation('country')"
          class="bg-gray-200 text-sm"
          name="location"
        >
          <option disabled value>Select a country</option>
          <option
            v-for="(states, country, index) in countries"
            v-bind:key="index"
            >{{ country }}</option
          >
        </select>
        <select
          v-if="!!selection.country"
          v-model="selection.state"
          @change="selectLocation('state')"
          class="ml-2 bg-gray-200 text-sm"
          name="location"
        >
          <option disabled value>Select a state</option>
          <option
            v-for="(regions, state, index) in states"
            v-bind:key="index"
            >{{ state }}</option
          >
        </select>
        <select
          v-if="!!selection.state"
          v-model="selection.region"
          @change="selectLocation('region')"
          class="ml-2 bg-gray-200 text-sm"
          name="location"
        >
          <option disabled value>Select a region</option>
          <option
            v-for="(locactions, region, index) in regions"
            v-bind:key="index"
            >{{ region }}</option
          >
        </select>

        <select
          v-if="!!selection.region"
          v-model="selection.location"
          @change="selectLocation('location')"
          class="ml-2 bg-gray-200 text-sm"
          name="location"
        >
          <option disabled value>Select a location</option>
          <option
            v-for="(v, location, index) in locations"
            v-bind:key="index"
            >{{ location }}</option
          >
        </select>
      </div>
      <button type="button" class="form-button" @click="resetSelection">
        Reset
      </button>
    </div>
  </div>
</template>

<script>
import { db } from "@/config/firebase";

export default {
  props: ["label"],

  data: function() {
    return {
      selectConfig: {},
      selection: {
        country: "United States",
        state: "",
        region: "",
        location: ""
      }
    };
  },

  computed: {
    countries() {
      return this.selectConfig;
    },
    states() {
      return this.selectConfig[this.selection.country];
    },
    regions() {
      return this.selectConfig[this.selection.country][this.selection.state];
    },
    locations() {
      return this.selectConfig[this.selection.country][this.selection.state][
        this.selection.region
      ];
    }
  },

  methods: {
    selectLocation(locationType) {
      if (locationType === "country") {
        this.selection.state = "";
        this.selection.region = "";
        this.selection.location = "";
      }
      if (locationType === "state") {
        this.selection.region = "";
        this.selection.location = "";
      }
      if (locationType === "region") {
        this.selection.location = "";
      }
      const cleanLocationParams = this.cleanParams(this.selection);
      this.$emit("selectLocation", cleanLocationParams);
    },
    cleanParams(params) {
      // remove empty params
      return Object.keys(params).reduce((cleanedParams, param) => {
        if (params[param]) {
          cleanedParams[param] = params[param];
        }
        return cleanedParams;
      }, {});
    },
    resetSelection() {
      this.selection = {
        country: "",
        state: "",
        region: "",
        location: ""
      };
      const cleanParams = this.cleanParams(this.selection);
      this.$emit("selectLocation", cleanParams);
    }
  },

  firestore: {
    selectConfig: db.collection("configs").doc("locationSelect")
  }
};
</script>
