<template>
  <div id="app" class="font-sans p-4 lg:mx-auto lg:w-1/2">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-center">Backcountry Buddy</h1>
      <Login
        v-bind:is-authenticated="isAuthenticated"
        v-bind:current-user="currentUser"
      />
    </div>
    <TourList />
  </div>
</template>

<script>
import TourList from "./components/TourList.vue";
import Login from "./components/Login.vue";
import { auth } from "@/config/firebase";

export default {
  name: "app",
  data: function() {
    return {
      isAuthenticated: false,
      currentUser: {
        email: ""
      }
    };
  },
  components: {
    TourList,
    Login
  },
  mounted() {
    auth.onAuthStateChanged(user => {
      if (!user) {
        this.resetAuthState();
        return;
      }
      this.isAuthenticated = true;
      const { email } = user;
      this.currentUser.email = email;
      // TODO: fetch user profile
    });
  },
  methods: {
    resetAuthState() {
      this.isAuthenticated = false;
      this.currentUser = { email: "" };
    }
  }
};
</script>
