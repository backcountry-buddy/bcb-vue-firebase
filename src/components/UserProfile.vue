<template>
  <div>
    <div class="flex justify-between items-center sticky top-0 bg-white py-2">
      <h2 class="text-lg font-semibold whitespace-no-wrap">
        <span v-if="profile.displayName">{{ profile.displayName }}</span>
        <span v-else>No One</span>
      </h2>
      <div>
        <slot></slot>
      </div>
    </div>

    <div v-if="profile.homeLocation" class="mb-4">
      <p class="text-sm text-gray-600 italic">Home location:</p>
      <p class="pl-4">{{ profile.homeLocation }}</p>
    </div>

    <div v-if="profile.experienceLevel" class="mb-4">
      <p class="text-sm text-gray-600 italic">Experience level:</p>
      <p class="pl-4">{{ experienceLevel }}</p>
    </div>

    <div v-if="profile.experienceLocations" class="mb-4">
      <p class="text-sm text-gray-600 italic">
        Experience in following places:
      </p>
      <p class="pl-4 whitespace-pre-wrap">{{ profile.experienceLocations }}</p>
    </div>

    <div v-if="profile.travelDestinations" class="mb-4">
      <p class="text-sm text-gray-600 italic">Willing to travel to:</p>
      <p class="pl-4 whitespace-pre-wrap">{{ profile.travelDestinations }}</p>
    </div>

    <div v-if="profile.aiare" class="mb-4">
      <p class="text-sm text-gray-600 italic">
        Completed saftey courses and trainings:
      </p>
      <p class="pl-4 whitespace-pre-wrap">{{ profile.aiare }}</p>
    </div>

    <div v-if="profile.pack" class="mb-4">
      <p class="text-sm text-gray-600 italic">
        What's typically in my pack?
      </p>
      <p class="pl-4 whitespace-pre-wrap">{{ profile.pack }}</p>
    </div>

    <div v-if="profile.otherInfo" class="mb-4">
      <p class="text-sm text-gray-600 italic">
        Other details:
      </p>
      <p class="pl-4 whitespace-pre-wrap">{{ profile.otherInfo }}</p>
    </div>
  </div>
</template>

<script>
import { experienceLevels } from "@/config/user-profile";

export default {
  props: { profile: Object },
  computed: {
    experienceLevel() {
      return experienceLevels[this.profile.experienceLevel];
    }
  }
};
</script>
