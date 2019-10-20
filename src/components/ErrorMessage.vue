<template>
  <div
    v-if="errorMessage"
    class="fixed left-0 bottom-0 right-0 bg-red-100 font-semibold border-t border-red-200 italic text-xs text-red-600 p-2"
  >
    {{ errorMessage }}
  </div>
</template>

<script>
// TODO: less than ideal. this should be replaced with error logging
export default {
  props: ['errorMessage']
};
</script>
