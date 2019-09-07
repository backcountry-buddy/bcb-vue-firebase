<template>
  <div id="app" class="font-sans p-4 lg:mx-auto lg:w-1/2">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-center">
        <router-link to="/">Backcountry Buddy</router-link>
      </h1>
      <LoginForm
        v-bind:is-authenticated="isAuthenticated"
        v-bind:current-user="currentUser"
      />
    </div>
    <router-view />
  </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";
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
    LoginForm
  },
  // TODO: should this be here or could it be just on the login component
  created() {
    auth.onAuthStateChanged(user => {
      if (!user) {
        this.resetAuthState();
        return;
      }
      this.isAuthenticated = true;
      const { email, displayName } = user;
      this.currentUser.email = email;
      this.currentUser.displayName = displayName;
    });
  },
  methods: {
    resetAuthState() {
      this.isAuthenticated = false;
      this.currentUser = { email: "", displayName: "" };
    }
  }
};
</script>
