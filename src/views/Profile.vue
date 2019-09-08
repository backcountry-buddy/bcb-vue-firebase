<template>
  <div class="mt-4">
    <UserProfileForm
      v-if="isEditing"
      v-on:toggle-editing="toggleEditing"
      :profile="profile"
      :currentUser="currentUser"
    />
    <div v-else>
      <h2 class="font-semibold mb-2 flex justify-between">
        Your public profile
        <button type="button" class="form-button" @click="toggleEditing">
          Edit Profile
        </button>
      </h2>
      <UserProfile :profile="profile" :currentUser="currentUser" />
    </div>
    <ErrorMessage :errorMessage="errorMessage" />
  </div>
</template>

<script>
import { auth, db } from "@/config/firebase";
import UserProfile from "@/components/UserProfile.vue";
import UserProfileForm from "@/components/UserProfileForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

export default {
  data() {
    return {
      isEditing: false,
      currentUser: {
        uid: "",
        email: "",
        displayName: ""
      },
      profile: {
        displayName: "",
        homeLocation: "",
        travelDestinations: "",
        experienceLocations: "",
        experienceLevel: "",
        aiare: "",
        pack: "",
        otherInfo: ""
      },
      errorMessage: ""
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
    this.displayName = displayName;
    this.fetchUserProfile(uid);
  },
  methods: {
    toggleEditing() {
      this.isEditing = !this.isEditing;
    },
    fetchUserProfile(uid) {
      this.errorMessage = "";
      const docRef = db.collection("users").doc(uid);
      docRef
        .get()
        .then(doc => {
          if (doc.exists) {
            const userProfile = doc.data();
            this.profile = userProfile;
          } else {
            this.errorMessage = "No user profile found";
          }
        })
        .catch(error => {
          this.errorMessage = error.message;
        });
    }
  }
};
</script>
