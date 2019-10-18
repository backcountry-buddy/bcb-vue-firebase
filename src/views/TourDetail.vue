<template>
  <div class="mt-4">
    <div class="mb-4 text-right">
      <router-link
        class="form-button"
        v-if="isCreator"
        :to="{ name: 'tourEdit', params: { id: tour.id } }"
        >Edit your tour</router-link
      >
    </div>
    <h2 class="py-2 sticky top-0 bg-white">
      <div class="flex justify-between">
        <span class="font-semibold text-lg">{{ tour.title }}</span>
        <span class="text-xs font-light whitespace-no-wrap ml-4 pt-2">{{
          tourDate
        }}</span>
      </div>
      <div class="flex flex-col">
        <span class="font-light">{{ tour.location }}</span>
        <span class="font-light text-xs"
          >{{ tour.state }}, {{ tour.country }}</span
        >
      </div>
    </h2>

    <p class="mb-2 mt-2">{{ tour.description }}</p>

    <div
      class="flex justify-between items-start border-t border-b border-gray-200 p-2 mt-4"
    >
      <div class="text-sm">
        <h3 class="mb-2">
          Lead by
          <span v-if="isCreator">you</span>
          <span v-else>
            <router-link
              v-if="tour.creatorRef && tour.creatorRef.id"
              class="link"
              :to="{ name: 'userDetail', params: { uid: tour.creatorRef.id } }"
            >
              {{ tour.creatorRef.displayName }}
            </router-link>
          </span>
        </h3>
        <div v-if="buddies.length">
          <h3 class="font-light">
            Joined by
            {{ buddies.length }}
            <span v-if="buddies.length > 1">buddies</span>
            <span v-else>buddy</span>
            <span v-if="isAuthenticated">:</span>
          </h3>
          <ul v-if="isAuthenticated" class="pl-2">
            <li class="font-light" v-for="buddy in buddies" :key="buddy.id">
              <router-link
                class="link text-sm"
                :to="{ name: 'userDetail', params: { uid: buddy.id } }"
              >
                <span v-if="buddy.id === currentUser.uid" class="font-semibold"
                  >You</span
                >
                <span v-else> {{ buddy.displayName }}</span></router-link
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
        <p v-else class="font-light">
          No tour buddies yet.
        </p>
      </div>
      <div class="flex justify-end">
        <button
          v-if="!isAuthenticated"
          type="button"
          @click="focusLogin"
          class="link text-sm"
        >
          Login to join tour!
        </button>
        <div v-if="!isCreator">
          <button
            v-if="canJoin"
            @click="joinTour"
            class="text-xs bg-green-100 py-1 px-2 border border-green-500 shadow"
          >
            Join tour
          </button>
          <button
            v-else-if="isAuthenticated"
            @click="leaveTour"
            class="text-xs bg-red-100 py-1 px-2 ml-1 border border-red-300 outline-none shadow"
          >
            Leave tour
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <form class="mb-2" @submit="saveComment">
        <textarea
          v-model="newComment"
          name="comment-from"
          class="form-input-sm w-full resize-none mb-1 border border-gray-200"
          rows="3"
          placeholder="Leave a comment..."
        ></textarea>
        <div class="flex justify-between items-center">
          <div v-if="comments.length" class="text-sm font-light">
            {{ comments.length }} Comment<span v-if="comments.length > 1"
              >s</span
            >
          </div>
          <button
            v-if="isAuthenticated"
            type="submit"
            class="form-button outline-none focus:outline-none"
          >
            Submit
          </button>
          <button
            v-else
            type="button"
            @click="focusLogin"
            class="form-button outline-none focus:outline-none"
          >
            Login to submit
          </button>
        </div>
      </form>

      <ul>
        <li class="my-4" v-for="comment in comments" :key="comment.id">
          <TourComment :comment="comment" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { auth, db, firestore } from "@/config/firebase";
import { DateTime } from "luxon";
import TourComment from "@/components/TourComment.vue";

export default {
  props: ["id"],
  data() {
    return {
      tour: {},
      buddies: [],
      comments: [],
      currentUser: {},
      newComment: ""
    };
  },

  components: { TourComment },

  created() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const { email, displayName, uid } = currentUser;
      this.currentUser = { email, displayName, uid };
    }
  },

  firestore() {
    return {
      tour: db.collection("tours").doc(this.id),
      buddies: db
        .collection("tours")
        .doc(this.id)
        .collection("buddies"),
      comments: db
        .collection("tours")
        .doc(this.id)
        .collection("comments")
        .orderBy("created", "desc")
    };
  },

  computed: {
    isAuthenticated() {
      return !!this.currentUser.uid;
    },
    tourDate() {
      if (!this.tour.plannedOn) {
        return;
      }
      const d = DateTime.fromSeconds(this.tour.plannedOn.seconds, {
        zone: "utc"
      });
      return d.toLocaleString(DateTime.DATE_MED);
    },
    isCreator() {
      return (
        this.tour.creatorRef && this.currentUser.uid === this.tour.creatorRef.id
      );
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
    },
    saveComment(evt) {
      evt.preventDefault();
      if (!this.isAuthenticated) return;
      const authorRef = db.collection("users").doc(this.currentUser.uid);
      const created = firestore.FieldValue.serverTimestamp();
      const body = this.newComment;
      const comment = {
        authorRef,
        created,
        body
      };
      db.collection("tours")
        .doc(this.id)
        .collection("comments")
        .add(comment);
      this.newComment = "";
    }
  }
};
</script>
