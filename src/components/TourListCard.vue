<template>
  <li class="border border-gray-200 bg-gray-100 p-2 mb-2 shadow">
    <h4 class="flex flex-col justify-between">
      <div class="flex justify-between">
        <router-link
          class="font-semibold text-lg underline"
          :to="{ name: 'tourDetail', params: { id: tour.id } }"
        >
          {{ tour.title }}
        </router-link>
        <span class="text-xs font-light whitespace-no-wrap pt-2">{{
          tourDate
        }}</span>
      </div>
      <div class="flex flex-col">
        <span class="font-light">{{ tour.location }}</span>
        <span class="font-light text-xs"
          >{{ tour.state }}, {{ tour.country }}</span
        >
      </div>
    </h4>
    <p class="mt-2 mb-2 truncate">{{ tour.description }}</p>
    <div class="flex justify-between items-end">
      <div class="font-light text-sm">
        <span v-if="isCreator">You</span>
        <span v-else>
          <router-link
            v-if="creator.id"
            class="link"
            :to="{ name: 'userDetail', params: { uid: creator.id } }"
            >{{ creator.displayName }}
          </router-link>
        </span>
        <span v-if="tour.nrBuddies">
          and
          {{ tour.nrBuddies }}
          <span v-if="tour.nrBuddies > 1">buddies</span>
          <span v-else>buddy</span>
        </span>
      </div>
      <router-link
        class="form-button mt-1"
        v-if="isCreator"
        :to="{ name: 'tourEdit', params: { id: tour.id } }"
        >Edit</router-link
      >
    </div>
  </li>
</template>

<script>
import { auth, db } from '@/config/firebase';
import { DateTime } from 'luxon';

export default {
  props: { tour: Object },
  data: function() {
    return {
      buddies: [],
      creator: {},
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
        zone: 'utc'
      });
      return d.toLocaleString(DateTime.DATE_MED);
    },
    isCreator() {
      return this.currentUser.uid === this.creator.id;
    },
    nrBuddies() {
      return db
        .collection('tours')
        .doc(this.tour.id)
        .collection('buddies');
    }
  },

  firestore() {
    // FIXME: not fully undestanding why this reference is sometimes bound
    // automatically and sometimes it's not
    const creatorDoc = this.tour.creatorRef.id
      ? db.collection('users').doc(this.tour.creatorRef.id)
      : db.doc(this.tour.creatorRef);
    return {
      creator: creatorDoc
    };
  }
};
</script>
