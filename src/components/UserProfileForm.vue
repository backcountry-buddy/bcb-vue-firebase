<template>
  <form @submit="onFormSubmit" class="flex flex-col">
    <h2 class="font-bold mb-2 flex justify-between">
      Edit your public profile
      <div>
        <button
          type="button"
          class="form-button text-gray-600 mr-2"
          @click="toggleEditing"
        >
          Cancel
        </button>
        <button type="submit" class="form-button">Save Profile</button>
      </div>
    </h2>

    <label for="display-name" class="text-sm italic">Name</label>
    <input
      type="text"
      name="display-name"
      v-model="currentUser.displayName"
      class="form-input focus:shadow-outline mb-1"
      placeholder="Nickname, real name or initials"
    />

    <label for="home-location" class="text-sm italic mt-2"
      >Home location or area</label
    >
    <input
      type="text"
      name="home-location"
      v-model="profile.homeLocation"
      class="form-input focus:shadow-outline mb-1"
      placeholder="City or general area you live in"
    />

    <label for="experience-level" class="text-sm italic mt-2"
      >Experience level</label
    >
    <!-- TODO: generate from config -->
    <select
      name="experience-level"
      v-model="profile.experienceLevel"
      class="form-input focus:shadow-outline mb-1"
    >
      <option value="1">I - On-piste double black diamond</option>
      <option value="2">II - Off-piste trees and glades</option>
      <option value="3">III - Sidecountry skinning and booting</option>
      <option value="4">IV - Backcountry mellow terrain</option>
      <option value="5">V - Backcountry couliers and steeps</option>
    </select>

    <label for="travel-destinations" class="text-sm italic mt-2"
      >Areas I'm willing to traveling to</label
    >
    <textarea
      name="travel-destinations"
      v-model="profile.travelDestinations"
      rows="3"
      placeholder="List of cities or areas you're willing to travel to"
      class="form-input focus:shadow-outline mb-1 resize-none"
    ></textarea>

    <label for="experience-locations" class="text-sm italic mt-2"
      >Areas I have experience in</label
    >
    <textarea
      name="experience-locations"
      v-model="profile.experienceLocations"
      rows="3"
      placeholder="List of areas you're experienced with"
      class="form-input focus:shadow-outline mb-1 resize-none"
    ></textarea>

    <label for="aiare" class="text-sm italic mt-2"
      >Completed avalanche trainings</label
    >
    <textarea
      name="aiare"
      v-model="profile.aiare"
      rows="3"
      placeholder="List of trainings and courses your completed"
      class="form-input focus:shadow-outline mb-1 resize-none"
    ></textarea>

    <label for="pack" class="text-sm italic mt-2">What's in your pack?</label>
    <textarea
      name="pack"
      v-model="profile.pack"
      rows="3"
      placeholder="Describe what's typically in your pack"
      class="form-input focus:shadow-outline mb-1 resize-none"
    ></textarea>

    <label for="otherInfo" class="text-sm italic mt-2"
      >Other intersting things about me:</label
    >
    <textarea
      name="otherInfo"
      v-model="profile.otherInfo"
      rows="3"
      placeholder="Other interesting details about me"
      class="form-input focus:shadow-outline mb-1 resize-none"
    ></textarea>

    <div class="text-right mt-4">
      <button
        type="button"
        class="form-button text-gray-600 mr-2"
        @click="toggleEditing"
      >
        Cancel
      </button>
      <button type="submit" class="form-button">Save Profile</button>
    </div>

    <ErrorMessage :errorMessage="errorMessage" />
  </form>
</template>

<script>
import { auth, db } from "@/config/firebase";
import ErrorMessage from "./ErrorMessage.vue";

export default {
  props: { profile: Object, currentUser: Object },
  data() {
    return {
      errorMessage: ""
    };
  },
  components: { ErrorMessage },
  methods: {
    toggleEditing() {
      this.$emit("toggle-editing");
    },
    onFormSubmit(evt) {
      evt.preventDefault();
      this.errorMessage = "";
      const user = auth.currentUser;
      const { uid, displayName } = this.currentUser;

      const saveUserMetaInfo = user
        .updateProfile({ displayName })
        .catch(error => {
          this.errorMessage = error.message;
        });

      const saveUserProfile = db
        .collection("users")
        .doc(uid)
        .set(this.profile)
        .catch(error => {
          this.errorMessage = error.message;
        });

      Promise.all([saveUserMetaInfo, saveUserProfile]).then(() => {
        this.toggleEditing();
      });
    }
  }
};
</script>
