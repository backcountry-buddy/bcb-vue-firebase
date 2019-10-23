import Vue from 'vue';
import App from './App.vue';
import { firestorePlugin } from 'vuefire';
import './main.css';
import router from './router';
import { auth } from './config/firebase';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import './registerServiceWorker';

Vue.use(firestorePlugin);

Vue.config.productionTip = false;

let app;

auth.onAuthStateChanged(user => {
  if (user) {
    const { uid: id, email, displayName: username } = user;
    Sentry.setUser({ id, email, username });
  }
  if (!app) {
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  }
});

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  });
}
