<template>
  <div class="mt-2 mb-4">
    <UserProfileForm
      v-if="isEditing"
      v-on:toggle-editing="toggleEditing"
      :profile="profile"
      :currentUser="currentUser"
    />
    <div v-else class="mt-2 mb-4">
      <UserProfile :profile="profile" :currentUser="currentUser"
        ><router-link
          class="link-xs mr-2"
          :to="{ name: 'userDetail', params: { uid: currentUser.uid } }"
        >
          Public profile</router-link
        >
        <button type="button" class="form-button" @click="toggleEditing">
          Edit Profile
        </button></UserProfile
      >
    </div>
  </div>
</template>

<script>
import { auth, db } from '@/config/firebase';
import UserProfile from '@/components/UserProfile.vue';
import UserProfileForm from '@/components/UserProfileForm.vue';

export default {
  data() {
    return {
      isEditing: false,
      currentUser: {
        uid: '',
        email: '',
        displayName: ''
      },
      profile: {}
    };
  },
  components: {
    UserProfile,
    UserProfileForm
  },
  created() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }
    const { uid, email, displayName } = currentUser;
    this.currentUser = { email, uid, displayName };
    this.fetchUserProfile(uid);
  },
  methods: {
    toggleEditing() {
      this.isEditing = !this.isEditing;
    },
    async fetchUserProfile(uid) {
      const doc = await db
        .collection('users')
        .doc(uid)
        .get();
      if (doc.exists) {
        this.profile = doc.data();
      }
    }
  }
};
</script>
