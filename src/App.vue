<template>
  <div id="app" class="font-sans px-2 md:p-4 lg:mx-auto lg:w-1/2">
    <div class="flex justify-between items-center py-2">
      <h1 class="flex flex-col flex-grow">
        <router-link
          to="/"
          class="text-xl font-semibold whitespace-no-wrap underline"
          >Backcountry Buddy</router-link
        >
        <span class="text-sm font-light italic"
          >Find your next tour buddies!</span
        >
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
