<template>
  <div>
    <div class="mb-2">
      <p class="font-semibold">
        <span v-if="profile.displayName">{{ profile.displayName }}</span>
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
