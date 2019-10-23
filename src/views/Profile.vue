<template>
  <div v-if="profileIsLoaded" class="mt-2 mb-4">
    <UserProfileForm
      v-if="isEditing"
      v-on:toggle-editing="toggleEditing"
      :profile="profile"
      :currentUser="currentUser"
    />
    <div v-else class="mt-2 mb-4">
      <div v-if="hasProfile">
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
      <div v-else class="text-center">
        <p class="mb-2">You don't have a public profile.</p>
        <button type="button" class="form-button" @click="createProfile">
          Create one now!
        </button>
      </div>
    </div>
    <ErrorMessage :errorMessage="errorMessage" />
  </div>
</template>

<script>
import { auth, db } from '@/config/firebase';
import UserProfile from '@/components/UserProfile.vue';
import UserProfileForm from '@/components/UserProfileForm.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

export default {
  data() {
    return {
      profileIsLoaded: false,
      hasProfile: false,
      isEditing: false,
      currentUser: {
        uid: '',
        email: '',
        displayName: ''
      },
      profile: {
        displayName: '',
        homeLocation: '',
        travelDestinations: '',
        experienceLocations: '',
        experienceLevel: '',
        aiare: '',
        pack: '',
        otherInfo: ''
      },
      errorMessage: ''
    };
  },
  components: {
    UserProfile,
    UserProfileForm,
    ErrorMessage
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
    fetchUserProfile(uid) {
      this.errorMessage = '';
      db.collection('users')
        .doc(uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            const userProfile = doc.data();
            this.profile = userProfile;
            this.hasProfile = true;
          }
        })
        .catch(error => {
          this.errorMessage = error.message;
        })
        .finally(() => {
          this.profileIsLoaded = true;
        });
    },
    createProfile() {
      const { uid } = this.currentUser;
      db.collection('users')
        .doc(uid)
        .set(this.profile)
        .then(() => {
          this.isEditing = true;
          this.hasProfile = true;
        })
        .catch(error => {
          this.authErrorMessage = error.message;
        });
    }
  }
};
</script>
