<template>
  <div v-if="tour">
    <TourForm
      v-if="tour"
      title="Edit your tour"
      :tour="tour"
      @save="saveTour"
    />
  </div>
</template>

<script>
import { firestore, db } from "@/config/firebase";
import TourForm from "@/components/TourForm.vue";

const tours = db.collection("tours");

export default {
  props: ["id"],

  data() {
    return {
      tour: null
    };
  },

  components: { TourForm },

  watch: {
    id: {
      immediate: true,
      handler(id) {
        this.$bind("tour", tours.doc(id));
      }
    }
  },

  methods: {
    async saveTour(tourData) {
      tourData.modified = firestore.FieldValue.serverTimestamp();
      await db
        .collection("tours")
        .doc(this.id)
        .set(tourData);
      this.$router.push({ name: "home" });
    }
  }
};
</script>
