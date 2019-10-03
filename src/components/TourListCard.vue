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
    <div class="flex justify-between items-end">
      <div class="font-light text-sm mt-1">
        <span class="font-semibold">
          Lead by
          <span v-if="isCreator">you</span>
          <span v-else>
            <router-link
              class="link"
              v-if="tour.creatorRef.id"
              :to="{ name: 'userDetail', params: { uid: tour.creatorRef.id } }"
            >
              {{ tour.creatorRef.displayName }}
            </router-link>
          </span>
        </span>
        <div v-if="buddies.length">
          Joined by
          {{ buddies.length }}
          <span v-if="buddies.length > 1">buddies</span>
          <span v-else>buddy</span>
          <span v-if="isAuthenticated">:</span>
          <ul v-if="isAuthenticated" class="pl-2">
            <li v-for="buddy in buddies" :key="buddy.id">
              <router-link
                class="link"
                :to="{ name: 'userDetail', params: { uid: buddy.id } }"
              >
                {{ buddy.displayName }}</router-link
              >
              <span v-if="isCreator">
                (<a
                  :href="`mailto:${buddy.email}?subject=${tour.title}`"
                  title="Send an email"
                  >{{ buddy.email }}</a
                >)</span
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="flex justify-end">
        <button
          v-if="!isAuthenticated"
          type="button"
          @click="focusLogin"
          class="link text-sm"
        >
          Login to join this tour!
        </button>
        <router-link
          class="form-button mt-1"
          v-if="isCreator"
          :to="{ name: 'tourEdit', params: { id: tour.id } }"
          >Edit</router-link
        >
        <div v-else>
          <button
            v-if="canJoin"
            @click="joinTour"
            class="text-xs bg-green-100 py-1 px-2 border border-green-500"
          >
            Join
          </button>
          <button
            v-else-if="isAuthenticated"
            @click="leaveTour"
            class="text-xs bg-red-100 py-1 px-2 ml-1 border border-red-300 outline-none"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
import { auth, db } from "@/config/firebase";
import { DateTime } from "luxon";

export default {
  props: { tour: Object },
  data: function() {
    return {
      buddies: [],
      currentUser: {}
    };
  },

  created() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const { email, displayName, uid } = currentUser;
      this.currentUser = { email, displayName, uid };
    }
  },

  computed: {
    isAuthenticated() {
      return !!this.currentUser.uid;
    },
    tourDate() {
      const d = DateTime.fromSeconds(this.tour.plannedOn.seconds, {
        zone: "utc"
      });
      return d.toLocaleString(DateTime.DATE_MED);
    },
    isCreator() {
      return this.currentUser.uid === this.tour.creatorRef.id;
    },
    canJoin() {
      return this.buddies.reduce((acc, buddy) => {
        return acc && this.currentUser.uid !== buddy.id;
      }, this.isAuthenticated);
    }
  },

  methods: {
    joinTour() {
      const { email, displayName, uid } = this.currentUser;
      db.collection("tours")
        .doc(this.tour.id)
        .collection("buddies")
        .doc(uid)
        .set({ email, displayName });
    },
    leaveTour() {
      const { uid } = this.currentUser;
      db.collection("tours")
        .doc(this.tour.id)
        .collection("buddies")
        .doc(uid)
        .delete();
    },
    focusLogin() {
      window.scrollTo(0, 0);
      document.querySelector("input[name=email").focus();
    }
  },

  watch: {
    tour: {
      immediate: true,
      handler(tour) {
        this.$bind(
          "buddies",
          db
            .collection("tours")
            .doc(tour.id)
            .collection("buddies")
        );
      }
    }
  }
};
</script>
