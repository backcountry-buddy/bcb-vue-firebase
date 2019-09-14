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
      path: "/tours/new",
      name: "tourCreate",
      component: () =>
        import(/* webpackChunkName: "TourCreate" */ "./views/TourCreate.vue"),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/tours/:id/edit",
      name: "tourEdit",
      component: () =>
        import(/* webpackChunkName: "TourEdit" */ "./views/TourEdit.vue"),
      meta: {
        requiresAuth: true
      },
      props: true
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
