<template>
  <div id="app" class="font-sans p-4 lg:mx-auto lg:w-1/2">
    <div class="flex justify-between items-center py-2">
      <h1 class="text-xl font-semibold text-center">
        <router-link to="/">Backcountry Buddy</router-link>
      </h1>
      <LoginForm />
    </div>
    <router-view />
  </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";

export default {
  name: "app",
  components: {
    LoginForm
  }
};
</script>
