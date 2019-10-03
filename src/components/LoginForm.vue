<template>
  <div v-if="isAuthenticated" class="flex flex-col items-end">
    <span class="text-xs mr-2"
      >Welcome, {{ currentUser.displayName || currentUser.email }}!</span
    >
    <div>
      <router-link to="/profile" class="link-xs">Profile</router-link>
      <span class="text-xs mx-1">|</span>
      <button type="button" class="link-xs focus:outline-none" @click="logOut">
        Log out
      </button>
    </div>
  </div>
  <div v-else class="w-3/12">
    <form @submit="loginFormSubmit" class="flex flex-col">
      <input
        type="email"
        v-model="email"
        name="email"
        class="form-input-xs focus:shadow-outline mb-1"
        placeholder="Your email"
        autocomplete="username"
        required
      />
      <input
        type="password"
        v-model="password"
        class="form-input-xs focus:shadow-outline mb-1"
        placeholder="A secure password"
        autocomplete="current-password"
        required
      />
      <div v-if="isSignUp" class="flex justify-between">
        <button type="submit" class="form-button">Sign up</button>
        <button
          type="button"
          class="link-xs px-2 focus:outline-none"
          @click="toggleSignUp"
        >
          Log in?
        </button>
      </div>
      <div v-else class="flex justify-between">
        <button type="submit" class="form-button">
          Log in
        </button>
        <button
          type="button"
          class="link-xs px-2 focus:outline-none"
          @click="toggleSignUp"
        >
          No account?
        </button>
      </div>
      <div v-if="authErrorMessage" class="italic text-xs text-red-600 mt-2">
        {{ authErrorMessage }}
      </div>
    </form>
  </div>
</template>

<script>
import { auth } from "@/config/firebase";

let unsubscribeFirebaseAuth;

export default {
  data: function() {
    return {
      email: "",
      password: "",
      isSignUp: false,
      authErrorMessage: "",
      isAuthenticated: false,
      currentUser: {
        email: "",
        displayName: "",
        uid: ""
      }
    };
  },
  created() {
    unsubscribeFirebaseAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        return;
      }
      this.isAuthenticated = true;
      const { email, displayName, uid } = user;
      this.currentUser.email = email;
      this.currentUser.displayName = displayName;
      this.currentUser.uid = uid;
    });
  },
  beforeDestroy() {
    unsubscribeFirebaseAuth();
  },
  methods: {
    toggleSignUp() {
      this.isSignUp = !this.isSignUp;
    },
    loginFormSubmit(evt) {
      evt.preventDefault();
      if (this.isSignUp) {
        this.signUp();
      } else {
        this.logIn();
      }
    },
    signUp() {
      auth
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(() => {
          this.resetLoginForm();
        })
        .catch(error => {
          this.authErrorMessage = error.message;
        });
    },
    logIn() {
      auth
        .signInWithEmailAndPassword(this.email, this.password)
        .then(() => {
          this.resetLoginForm();
        })
        .catch(error => {
          if (error.code.endsWith("user-not-found")) {
            this.authErrorMessage =
              "A user with this email address does not exist.";
          } else {
            this.authErrorMessage = error.message;
          }
        });
    },
    logOut() {
      auth
        .signOut()
        .then(() => {
          this.resetLoginForm();
          this.resetAuthState();
          if (this.$router.currentRoute.meta.requiresAuth) {
            this.$router.push("/");
          }
        })
        .catch(error => {
          this.authErrorMessage = error.message;
        });
    },
    resetLoginForm() {
      this.email = "";
      this.password = "";
      this.authErrorMessage = "";
    },
    resetAuthState() {
      this.isAuthenticated = false;
      this.currentUser = { email: "", displayName: "" };
    }
  }
};
</script>
