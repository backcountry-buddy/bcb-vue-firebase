<template>
  <div class="mt-4">
    <div v-if="errorMessage">{{ errorMessage }}</div>

    <form v-if="isEditing" @submit="profileFormSubmit" class="flex flex-col">
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
        >Areas I'm traveling to</label
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
    </form>

    <!-- TODO: make this a component -->
    <div v-else>
      <h2 class="font-semibold mb-2 flex justify-between">
        Your public profile
        <button type="button" class="form-button" @click="toggleEditing">
          Edit Profile
        </button>
      </h2>

      <div class="mb-2">
        <p class="font-semibold">
          <span v-if="currentUser.displayName">{{
            currentUser.displayName
          }}</span>
          <span v-else-if="currentUser.email">{{ abbrEmailName }}</span>
        </p>
        <p v-if="profile.homeLocation" class="text-sm">
          {{ profile.homeLocation }}
        </p>
      </div>

      <div v-if="profile.experienceLevel" class="mb-2">
        <p class="text-sm text-gray-800">Experience level:</p>
        <p class="pl-4">{{ experienceLevel }}</p>
      </div>

      <div v-if="profile.experienceLocations" class="mb-2">
        <p class="text-sm text-gray-800">
          Experience in following places:
        </p>
        <p class="pl-4">{{ profile.experienceLocations }}</p>
      </div>

      <div v-if="profile.travelDestinations" class="mb-2">
        <p class="text-sm text-gray-800">Willing to travel to:</p>
        <p class="pl-4">{{ profile.travelDestinations }}</p>
      </div>

      <div v-if="profile.aiare" class="mb-2">
        <p class="text-sm text-gray-800">
          Completed saftey courses and trainings:
        </p>
        <p class="pl-4">{{ profile.aiare }}</p>
      </div>

      <div v-if="profile.pack" class="mb-2">
        <p class="text-sm text-gray-800">
          What's typically in my pack?
        </p>
        <p class="pl-4">{{ profile.pack }}</p>
      </div>

      <div v-if="profile.otherInfo" class="mb-2">
        <p class="text-sm text-gray-800">
          Other details:
        </p>
        <p class="pl-4">{{ profile.otherInfo }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from "@/config/firebase";
import { db } from "@/config/firebase";

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
  created() {
    auth.onAuthStateChanged(user => {
      if (!user) {
        // TODO: protect route
        console.log("protected, transition to home");
        return;
      }
      const { uid, email, displayName } = user;
      this.currentUser = { email, uid, displayName };
      this.displayName = displayName;
      this.fetchUserProfile(uid);
    });
  },
  computed: {
    abbrEmailName() {
      return `${this.currentUser.email.split("@")[0].substring(0, 3)}...`;
    },
    experienceLevel() {
      // TODO: DRY up
      return [
        "N/A",
        "I - On-piste double black diamond",
        "II - Off-piste trees and glades",
        "III - Sidecountry skinning and booting",
        "IV - Backcountry mellow terrain",
        "V - Backcountry couliers and steeps"
      ][this.profile.experienceLevel];
    }
  },
  methods: {
    toggleEditing() {
      this.isEditing = !this.isEditing;
    },
    fetchUserProfile(uid) {
      const docRef = db.collection("users").doc(uid);
      docRef
        .get()
        .then(doc => {
          if (doc.exists) {
            const userProfile = doc.data();
            this.profile = userProfile;
          } else {
            // TODO: show error message
            console.log("No such document!");
          }
        })
        .catch(error => {
          // TODO: show error message
          console.log("Error getting document:", error);
        });
    },
    profileFormSubmit(evt) {
      evt.preventDefault();
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
        this.isEditing = false;
      });
    }
  }
};
</script>
