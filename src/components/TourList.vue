<template>
  <div class="mt-4">
    <h2 class="my-2 text-lg font-light flex justify-between items-center">
      Planned Tours
      <router-link
        v-if="isAuthenticated"
        to="/new-tour"
        class="bg-gray-200 py-1 px-2"
        >Post a new tour</router-link
      >
    </h2>
    <LocationFilter @applyFilter="applyFilter" />
    <ul>
      <TourListCard v-for="(tour, index) in tours" :key="index" :tour="tour" />
    </ul>
  </div>
</template>

<script>
import { db, auth } from "@/config/firebase";
import LocationFilter from "./LocationFilter.vue";
import TourListCard from "./TourListCard.vue";

// TODO: verify this is timezone safe
const plannedTours = db.collection("tours").where("plannedOn", ">", new Date());
let unsubscribeFirebaseAuth;

export default {
  data: function() {
    return {
      isAuthenticated: false,
      tours: [],
      filter: {}
    };
  },

  created() {
    unsubscribeFirebaseAuth = auth.onAuthStateChanged(user => {
      this.isAuthenticated = !!user;
    });
  },

  beforeDestroy() {
    unsubscribeFirebaseAuth();
  },

  components: {
    LocationFilter,
    TourListCard
  },

  watch: {
    // TODO: there must be a better way to compose query objects...
    filter(f) {
      const queryScenario = Object.keys(f).length;
      switch (queryScenario) {
        // country
        case 1:
          this.$bind("tours", plannedTours.where("country", "==", f.country));
          break;
        // country + state
        case 2:
          this.$bind(
            "tours",
            plannedTours
              .where("country", "==", f.country)
              .where("state", "==", f.state)
          );
          break;
        // country + state = region
        case 3:
          this.$bind(
            "tours",
            plannedTours
              .where("country", "==", f.country)
              .where("state", "==", f.state)
              .where("region", "==", f.region)
          );
          break;
        default:
          this.$bind("tours", plannedTours.limit(20));
          break;
      }
    }
  },

  methods: {
    applyFilter(filter) {
      this.filter = filter;
    }
  },

  firestore() {
    return {
      tours: plannedTours.limit(20)
    };
  }
};
</script>
