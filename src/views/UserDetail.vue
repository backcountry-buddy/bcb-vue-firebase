<template>
  <div class="mt-2">
    <UserProfile v-if="profile.id" :profile="profile" />
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import UserProfile from '@/components/UserProfile.vue';

export default {
  props: ['uid'],
  data() {
    return {
      profile: {}
    };
  },
  firestore() {
    return {
      profile: db.collection('users').doc(this.uid)
    };
  },
  components: {
    UserProfile
  }
};
</script>
