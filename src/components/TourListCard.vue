<template>
  <li class="border border-gray-200 bg-gray-100 p-2 mb-2">
    <h4 class="flex justify-between mb-1">
      <div class="flex flex-col">
        <span class="font-semibold text-lg">{{ tour.title }}</span>
        <span class="text-xs font-light">{{ tourDate }}</span>
      </div>
      <div class="flex flex-col items-end">
        <span class="font-light">{{ tour.location }}</span>
        <span class="font-light text-xs"
          >{{ tour.state }}, {{ tour.country }}</span
        >
      </div>
    </h4>
    <p class="">{{ tour.description }}</p>
    <div class="font-light text-sm mt-1">
      Posted by
      <router-link
        class="link"
        v-if="tour.creatorRef.id"
        :to="{ name: 'userDetail', params: { uid: tour.creatorRef.id } }"
      >
        {{ tour.creatorRef.displayName }}
      </router-link>
    </div>
    <router-link
      class="form-button mt-1"
      v-if="canEdit"
      :to="{ name: 'tourEdit', params: { id: tour.id } }"
      >Edit</router-link
    >
  </li>
</template>

<script>
import { auth } from "@/config/firebase";
import { DateTime } from "luxon";

let unsubscribeFirebaseAuth;

export default {
  props: { tour: Object },
  data: function() {
    return {
      isAuthenticated: false,
      currentUser: {}
    };
  },

  created() {
    unsubscribeFirebaseAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        return;
      }
      this.isAuthenticated = true;
      this.currentUser.uid = user.uid;
    });
  },

  beforeDestroy() {
    unsubscribeFirebaseAuth();
  },

  computed: {
    tourDate() {
      const d = DateTime.fromSeconds(this.tour.plannedOn.seconds, {
        zone: "utc"
      });
      return d.toLocaleString(DateTime.DATE_MED);
    },
    canEdit() {
      return this.currentUser.uid === this.tour.creatorRef.id;
    }
  }
};
</script>
