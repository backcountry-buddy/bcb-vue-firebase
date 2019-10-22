<template>
  <div class="mt-4">
    <h2 class="my-2 text-lg font-light flex justify-between items-center">
      Planned Tours
      <router-link
        v-if="isAuthenticated"
        to="/tours/plan"
        class="bg-orange-200 py-1 px-2 shadow text-sm"
        >Plan a tour!</router-link
      >
    </h2>
    <LocationSelect
      class="border-t border-b py-2 my-4"
      @selectLocation="applyFilter"
      label="Filter planned tours by location"
    />
    <ul v-if="tours.length">
      <TourListCard v-for="tour in tours" :key="tour.id" :tour="tour" />
    </ul>
    <div v-else class="text-center">
      No tours found.
    </div>
  </div>
</template>

<script>
import { db, auth } from '@/config/firebase';
import LocationSelect from './LocationSelect.vue';
import TourListCard from './TourListCard.vue';

// TODO: verify this is timezone safe
const plannedTours = db.collection('tours').where('plannedOn', '>', new Date());
let unsubscribeFirebaseAuth;

export default {
  data: function() {
    return {
      isAuthenticated: false,
      tours: []
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
    LocationSelect,
    TourListCard
  },

  methods: {
    // TODO: there must be a better way to compose query objects...
    applyFilter(locationFilter) {
      const queryScenario = Object.keys(locationFilter).length;
      switch (queryScenario) {
        // country
        case 1:
          this.$bind(
            'tours',
            plannedTours.where('country', '==', locationFilter.country)
          );
          break;
        // country + state
        case 2:
          this.$bind(
            'tours',
            plannedTours
              .where('country', '==', locationFilter.country)
              .where('state', '==', locationFilter.state)
          );
          break;
        // country + state + region
        case 3:
          this.$bind(
            'tours',
            plannedTours
              .where('country', '==', locationFilter.country)
              .where('state', '==', locationFilter.state)
              .where('region', '==', locationFilter.region)
          );
          break;
        // country + state + region + location
        case 4:
          this.$bind(
            'tours',
            plannedTours
              .where('country', '==', locationFilter.country)
              .where('state', '==', locationFilter.state)
              .where('region', '==', locationFilter.region)
              .where('location', '==', locationFilter.location)
          );
          break;
        default:
          this.$bind('tours', plannedTours.limit(20));
          break;
      }
    }
  },

  firestore() {
    return {
      tours: plannedTours.limit(20)
    };
  }
};
</script>
