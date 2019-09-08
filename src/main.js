import Vue from "vue";
import App from "./App.vue";
import { firestorePlugin } from "vuefire";
import "./main.css";
import router from "./router";
import { auth } from "./config/firebase";

Vue.use(firestorePlugin);

Vue.config.productionTip = false;

let app;

auth.onAuthStateChanged(() => {
  if (!app) {
    new Vue({
      router,
      render: h => h(App)
    }).$mount("#app");
  }
});
