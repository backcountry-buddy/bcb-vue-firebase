<template>
  <div id="app" class="font-sans px-2 md:p-4 lg:mx-auto lg:w-1/2">
    <header class="flex justify-between items-start mt-2">
      <h1 class="overflow-x-hidden mt-1">
        <router-link to="/">
          <div>
            <svg
              class="-mt-1 fill-current inline-block"
              xmlns="http://www.w3.org/2000/svg"
              width="39"
              height="16"
              viewBox="0 0 90 39"
            >
              <polygon
                fill-rule="evenodd"
                points="50.785 11.439 78.154 38.808 68.585 38.808 46 16.223 44.322 17.901 65.229 38.808 55.66 38.808 39.538 22.686 37.86 24.364 52.305 38.808 42.735 38.808 33.075 29.148 31.476 30.747 39.538 38.808 29.968 38.808 26.692 35.532 23.415 38.808 13.846 38.808 41.215 11.439 39.538 9.761 10.49 38.808 .921 38.808 39.538 .192 46 6.654 52.462 .192 91.079 38.808 81.51 38.808 52.462 9.761"
                transform="translate(-1)"
              />
            </svg>
            <span class="text-lg font-semibold whitespace-no-wrap">
              Backcountry Buddy
            </span>
          </div>

          <span class="text-sm font-light italic ml-2">
            Find your next tour buddies!
          </span>
        </router-link>
      </h1>
      <LoginForm />
    </header>
    <router-view />
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue';

export default {
  name: 'app',
  components: {
    LoginForm
  }
};
</script>
