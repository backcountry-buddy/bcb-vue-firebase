<template>
  <div v-if="isAuthenticated">
    <!-- TODO: replace with a good display name -->
    <span class="text-xs mr-2">Welcome, {{ currentUser.email }}!</span>
    <button type="button" class="form-button" @click="logOut">
      Log out
    </button>
  </div>
  <div v-else class="w-3/12">
    <form @submit="loginFormSubmit" class="flex flex-col">
      <input
        type="email"
        v-model="email"
        class="form-input focus:shadow-outline mb-1"
        placeholder="Your Email"
        autocomplete="username"
        required
      />
      <input
        type="password"
        v-model="password"
        class="form-input focus:shadow-outline mb-1"
        placeholder="A Secure Password"
        autocomplete="current-password"
        required
      />
      <div v-if="isSignUp" class="flex justify-between">
        <button type="submit" class="form-button">Sign up</button>
        <button
          type="button"
          class="text-xs px-2 focus:outline-none text-blue-400 underline"
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
          class="text-xs px-2 focus:outline-none text-blue-400 underline"
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

export default {
  data: function() {
    return {
      email: "",
      password: "",
      isSignUp: false,
      authErrorMessage: ""
    };
  },
  props: {
    isAuthenticated: Boolean,
    currentUser: {
      type: Object,
      default: function() {
        return { email: "" };
      }
    }
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
        .then((/*data*/) => {
          // TODO: create user profile with data.user.uid and data.user.email
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
        })
        .catch(error => {
          this.authErrorMessage = error.message;
        });
    },
    resetLoginForm() {
      this.email = "";
      this.password = "";
      this.authErrorMessage = "";
    }
  }
};
</script>
