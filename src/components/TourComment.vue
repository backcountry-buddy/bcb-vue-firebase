<template>
  <div>
    <p class="text-sm">{{ comment.body }}</p>
    <div class="text-gray-600 text-xs font-light flex justify-between">
      <router-link
        class="link"
        v-if="comment.authorRef.id"
        :to="{ name: 'userDetail', params: { uid: comment.authorRef.id } }"
      >
        {{ comment.authorRef.displayName }}</router-link
      >
      <span v-if="isShowingRelativeDate" class="italic">{{
        relativeDate
      }}</span>
      <span v-else class="italic">{{ createdDate }}</span>
    </div>
  </div>
</template>

<script>
import { DateTime } from "luxon";

export default {
  props: { comment: Object },

  computed: {
    isShowingRelativeDate() {
      if (!this.comment.created) return;
      const created = DateTime.fromSeconds(this.comment.created.seconds, {
        zone: "utc"
      });
      const sameTimeYesterday = DateTime.local().minus({ days: 1 });
      return created > sameTimeYesterday;
    },
    createdDate() {
      if (!this.comment.created) return;
      const d = DateTime.fromSeconds(this.comment.created.seconds, {
        zone: "utc"
      });
      return d.toLocaleString(DateTime.DATETIME_MED);
    },
    relativeDate() {
      if (!this.comment.created) return;
      return DateTime.fromSeconds(this.comment.created.seconds, {
        zone: "utc"
      }).toRelative();
    }
  }
};
</script>
