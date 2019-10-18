<template>
  <TourForm title="Plan a tour" :tour="tour" @save="createTour" />
</template>

<script>
import { firestore, db } from "@/config/firebase";
import TourForm from "@/components/TourForm.vue";

export default {
  data() {
    return {
      tour: {
        title: "",
        description: "",
        plannedOn: firestore.Timestamp.fromDate(new Date()),
        creatorRef: "",
        created: "",
        locationRef: "",
        country: "",
        state: "",
        region: "",
        location: "",
        coordinates: ""
      }
    };
  },

  components: { TourForm },

  methods: {
    async createTour(tourData) {
      tourData.created = firestore.FieldValue.serverTimestamp();
      await db.collection("tours").add(tourData);
      this.$router.push({ name: "home" });
    }
  }
};
</script>
