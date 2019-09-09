import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import { auth } from "./config/firebase";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      // TODO: we also need a public profile version, e.g. /users/uid
      path: "/profile",
      name: "profile",
      component: () =>
        import(/* webpackChunkName: "Profile" */ "./views/Profile.vue"),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/users/:uid",
      name: "userDetail",
      component: () =>
        import(/* webpackChunkName: "UserDetail" */ "./views/UserDetail.vue")
    },
    {
      path: "/new-tour",
      name: "newTour",
      component: () =>
        import(/* webpackChunkName: "NewTour" */ "./views/NewTour.vue"),
      meta: {
        requiresAuth: true
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
    next("/");
  } else {
    next();
  }
});

export default router;
