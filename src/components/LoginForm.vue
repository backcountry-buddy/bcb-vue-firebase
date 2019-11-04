<template>
  <div class="login-form h-8 w-8 overflow-visible z-10 relative">
    <button
      v-if="isAuthenticated"
      type="button"
      @click="toggleMenu"
      class="focus:outline-none flex-shrink-0"
    >
      <svg
        class="user-avatar fill-current text-gray-400"
        height="32px"
        width="32px"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        x="0px"
        y="0px"
        viewBox="0 0 100 100"
        style="enable-background:new 0 0 100 100;"
        xml:space="preserve"
      >
        <g>
          <circle cx="50" cy="40.2" r="14.5"></circle>
          <path
            d="M50,5C25.1,5,5,25.1,5,50c0,15,7.3,28.2,18.6,36.4c0,0,0,0,0,0c0.6,0.4,1.1,0.8,1.7,1.2c0,0,0,0,0,0   c0.6,0.4,1.2,0.7,1.8,1.1c0,0,0.1,0,0.1,0.1c0.6,0.3,1.2,0.7,1.8,1c0.1,0,0.1,0.1,0.2,0.1c0.6,0.3,1.2,0.6,1.7,0.9   c0.1,0,0.2,0.1,0.2,0.1c0.6,0.3,1.1,0.5,1.7,0.8c0.1,0,0.2,0.1,0.3,0.1c0.5,0.2,1.1,0.4,1.7,0.6c0.2,0.1,0.3,0.1,0.5,0.2   c0.5,0.2,1.1,0.4,1.6,0.5c0.2,0.1,0.4,0.1,0.6,0.2c0.5,0.1,1,0.3,1.5,0.4c0.2,0.1,0.5,0.1,0.7,0.2c0.5,0.1,0.9,0.2,1.4,0.3   c0.3,0.1,0.6,0.1,0.9,0.2c0.4,0.1,0.9,0.2,1.3,0.2c0.4,0.1,0.7,0.1,1.1,0.1c0.4,0,0.8,0.1,1.2,0.1c0.4,0,0.9,0.1,1.3,0.1   c0.3,0,0.6,0.1,0.9,0.1c0.8,0,1.5,0.1,2.3,0.1c0.8,0,1.6,0,2.3-0.1c0.2,0,0.4,0,0.6,0c0.6,0,1.1-0.1,1.7-0.1c0.2,0,0.5-0.1,0.7-0.1   c0.5-0.1,1.1-0.1,1.6-0.2c0.2,0,0.4-0.1,0.6-0.1c0.5-0.1,1.1-0.2,1.6-0.3c0.2,0,0.4-0.1,0.6-0.1c0.5-0.1,1.1-0.2,1.6-0.4   c0.2,0,0.3-0.1,0.5-0.1c0.6-0.2,1.1-0.3,1.7-0.5c0.1,0,0.3-0.1,0.4-0.1c0.6-0.2,1.2-0.4,1.7-0.6c0.1,0,0.2-0.1,0.3-0.1   c0.6-0.2,1.2-0.5,1.8-0.7c0.1,0,0.1-0.1,0.2-0.1c0.6-0.3,1.2-0.5,1.8-0.8c0.1,0,0.1-0.1,0.2-0.1c0.6-0.3,1.2-0.6,1.8-1   c0,0,0.1,0,0.1-0.1c0.6-0.3,1.2-0.7,1.8-1.1c0,0,0,0,0,0c0.6-0.4,1.2-0.8,1.8-1.2c0,0,0,0,0,0C87.3,78.9,95,65.4,95,50   C95,25.1,74.9,5,50,5z M81.6,74.4c-0.9-8.5-7.1-15.5-15.6-17.2c-2.9-0.6-6-1-9.3-1.3c-2,0.8-4.1,1.3-6.4,1.3   c-2.2,0-4.4-0.4-6.3-1.2c-3.2,0.3-6.1,0.7-8.9,1.2c-8.7,1.7-15.1,9.2-15.6,18c0,0.2,0,0.4,0,0.6c-5.9-7-9.5-16-9.5-25.8   c0-22.1,17.9-40,40-40s40,17.9,40,40C90,59.2,86.9,67.7,81.6,74.4z"
          ></path>
        </g>
      </svg>
    </button>
    <div v-else class="mt-1 flex justify-end items-center">
      <router-link to="/about" class="link-sm mr-1">About</router-link>
      <button
        type="button"
        class="link-sm focus:outline-none"
        @click="toggleMenu"
      >
        Login
      </button>
    </div>
    <div v-if="isShowingMenu" class="absolute right-0">
      <ul
        v-if="isAuthenticated"
        class="bg-gray-800 border border-gray-200 mt-2 px-2 shadow-lg"
      >
        <li class="pt-2 pb-1">
          <router-link to="/profile" class="link-sm whitespace-no-wrap"
            >Your Profile</router-link
          >
        </li>
        <li class="pb-2 pt-1">
          <router-link to="/about" class="link-sm whitespace-no-wrap"
            >About</router-link
          >
        </li>
        <li class="border-t pt-1 pb-2">
          <button
            type="button"
            class="link-sm focus:outline-none whitespace-no-wrap "
            @click="logOut"
          >
            Log out
          </button>
        </li>
      </ul>
      <div v-else class="bg-gray-800 w-56 p-4 mt-2 shadow-lg">
        <div
          v-if="passwordResetEmailIsSent"
          class="italic text-xs text-red-500 mb-2 border-b pb-2"
        >
          Please check your inbox, we just sent you an email with a link to
          reset your Password.
        </div>
        <form @submit="loginFormSubmit" class="flex flex-col">
          <input
            type="email"
            v-model="email"
            name="email"
            class="text-base p-1 outline-none border focus:shadow-outline mb-1 bg-white"
            placeholder="Your email"
            autocomplete="username"
            required
          />
          <input
            v-if="!isPasswordReset"
            type="password"
            v-model="password"
            class="text-base p-1 outline-none border focus:shadow-outline mb-1 bg-white"
            placeholder="Secure password"
            autocomplete="current-password"
            required
          />

          <p v-if="isSignUp" class="text-xs italic text-gray-400 pb-1">
            By creating your account, you agree to our
            <a
              class="link"
              href="https://www.termsfeed.com/privacy-policy/8e62d93c33a471ed969b5c3f82750433"
              target="blank"
              >Privacy Policy</a
            >
            and
            <a
              class="link"
              href="https://www.termsfeed.com/terms-conditions/3677b904f161197291869a4590ec605d"
              target="blank"
              >Terms of Use</a
            >.
          </p>

          <button type="submit" class="form-button">
            <span v-if="isPasswordReset">Password Reset</span>
            <span v-else-if="isSignUp">Sign up</span>
            <span v-else>Log in</span>
          </button>

          <div v-if="authErrorMessage" class="italic text-xs text-red-600 mt-2">
            {{ authErrorMessage }}
          </div>
        </form>

        <div
          v-if="!isPasswordReset"
          class="mt-4 border-t text-sm text-gray-400 pt-2"
        >
          <span v-if="isSignUp">Have an account?</span>
          <span v-else>New to Backcountry Buddy?</span>
          <button
            type="button"
            class="mt-2 border-gray-500 py-1 px-2 border focus:outline-none w-full bg-white text-gray-600"
            @click="toggleSignUp"
          >
            <span v-if="isSignUp">Log in</span>
            <span v-else>Sign up</span>
          </button>
        </div>

        <div
          v-if="!isPasswordReset && !passwordResetEmailIsSent"
          class="mt-4 border-t pt-2"
        >
          <button type="button" class="link-sm" @click="resetPassword">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '@/config/firebase';
import { EventBus } from '@/event-bus.js';

export default {
  data: function() {
    return {
      email: '',
      password: '',
      isShowingMenu: false,
      isSignUp: false,
      isPasswordReset: false,
      passwordResetEmailIsSent: false,
      authErrorMessage: '',
      currentUser: {
        email: '',
        displayName: '',
        uid: ''
      }
    };
  },

  created() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const { email, displayName, uid } = currentUser;
      this.currentUser = { uid, email, displayName };
    }

    EventBus.$on('focus-login', this.focusLogin);
  },

  beforeDestroy() {
    EventBus.$off('focus-login', this.focusLogin);
  },

  computed: {
    isAuthenticated() {
      return !!this.currentUser.uid;
    }
  },

  watch: {
    $route() {
      this.isShowingMenu = false;
    }
  },

  methods: {
    toggleMenu() {
      this.isShowingMenu = !this.isShowingMenu;
    },
    toggleSignUp() {
      this.isPasswordReset = false;
      this.passwordResetEmailIsSent = false;
      this.isSignUp = !this.isSignUp;
    },
    resetPassword() {
      this.passwordResetEmailIsSent = false;
      this.isPasswordReset = true;
    },
    focusLogin() {
      window.scrollTo(0, 0);
      this.isShowingMenu = true;
      this.$nextTick(() => this.$el.querySelector('input[name=email').focus());
    },
    loginFormSubmit(evt) {
      evt.preventDefault();
      if (this.isPasswordReset) {
        this.sendPasswordResetEmail();
      } else if (this.isSignUp) {
        this.signUp();
      } else {
        this.logIn();
      }
    },
    async signUp() {
      try {
        await auth.createUserWithEmailAndPassword(this.email, this.password);
      } catch (error) {
        this.authErrorMessage = error.message;
      }
    },
    async logIn() {
      this.authErrorMessage = '';
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
      } catch (error) {
        if (error.code.endsWith('user-not-found')) {
          this.authErrorMessage =
            'A user with this email address does not exist.';
        } else {
          this.authErrorMessage = error.message;
        }
      }
    },
    async logOut() {
      this.authErrorMessage = '';
      try {
        await auth.signOut();
        if (this.$router.currentRoute.meta.requiresAuth) {
          this.$router.push('/');
        }
      } catch (error) {
        this.authErrorMessage = error.message;
      }
    },
    async sendPasswordResetEmail() {
      this.authErrorMessage = '';
      try {
        await auth.sendPasswordResetEmail(this.email, {
          url: window.location.href
        });
        this.isPasswordReset = false;
        this.isSignUp = false;
        this.passwordResetEmailIsSent = true;
      } catch (error) {
        console.log(error);
        let { code, message } = error;
        if (code === 'auth/user-not-found') {
          message = 'There is no user signed up with this email address.';
        }
        this.authErrorMessage = message;
      }
    }
  }
};
</script>
