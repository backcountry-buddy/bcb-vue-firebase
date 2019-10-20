<template>
  <div v-if="tour">
    <TourForm
      v-if="tour"
      title="Edit your tour"
      :tour="tour"
      @save="saveTour"
      @delete="deleteTour"
    />
  </div>
</template>

<script>
import { firestore, db } from '@/config/firebase';
import TourForm from '@/components/TourForm.vue';

export default {
  props: ['id'],

  data() {
    return {
      tour: null
    };
  },

  components: { TourForm },

  firestore() {
    return {
      tour: db.collection('tours').doc(this.id)
    };
  },

  methods: {
    async saveTour(tourData) {
      tourData.modified = firestore.FieldValue.serverTimestamp();
      await db
        .collection('tours')
        .doc(this.id)
        .set(tourData);
      this.$router.push({ name: 'home' });
    },
    async deleteTour(tourId) {
      await db
        .collection('tours')
        .doc(tourId)
        .delete();
      this.$router.push({ name: 'home' });
    }
  }
};
</script>
