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
        import(/* webpackChunkName: "UserDetail" */ "./views/UserDetail.vue"),
      props: true
    },
    {
      path: "/tours/plan",
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
    },
    {
      path: "/tours/:id",
      name: "tourDetail",
      component: () =>
        import(/* webpackChunkName: "TourDetail" */ "./views/TourDetail.vue"),
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
