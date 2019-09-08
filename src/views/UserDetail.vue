<template>
  <div class="mt-4">
    <UserProfile :profile="profile" />
  </div>
</template>

<script>
import { db } from "@/config/firebase";
import UserProfile from "@/components/UserProfile.vue";

export default {
  data() {
    return {
      uid: this.$route.params.uid,
      profile: {}
    };
  },
  firestore() {
    return {
      profile: db.collection("users").doc(this.uid)
    };
  },
  components: {
    UserProfile
  }
};
</script>
