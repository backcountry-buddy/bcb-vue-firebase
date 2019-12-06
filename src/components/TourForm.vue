<template>
  <div class="mt-4">
    <form @submit="onFormSubmit" class="flex flex-col">
      <h2 class="text-lg font-light flex justify-between mb-4">
        <span class="flex-grow">{{ title }}</span>
        <button
          type="button"
          @click="goBack"
          class="form-button text-gray-600 mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isEditing && !currentUserIsCreator"
          class="form-button-green"
          :class="{
            'opacity-50 cursor-not-allowed': isEditing && !currentUserIsCreator
          }"
        >
          Save
        </button>
      </h2>

      <div class="flex flex-col md:flex-row md:justify-between md:mb-2">
        <div class="flex flex-col flex-grow mb-2 md:mb-0 md:mr-2">
          <label for="title" class="text-sm italic mt-2">Tour title</label>
          <input
            type="text"
            id="title"
            v-model="tour.title"
            class="form-input focus:shadow-outline"
            placeholder="A short title for your tour"
          />
        </div>
        <div class="flex flex-col mb-2 md:mb-0">
          <label for="planned-on" class="text-sm italic mt-2"
            >When are you going?</label
          >
          <input
            type="date"
            id="planned-on"
            :value="localizedPlannedOn"
            @input="updatePlannedOn"
            placeholder="YYYY-MM-DD"
            class="form-input focus:shadow-outline"
          />
        </div>
      </div>

      <label class="text-sm italic mt-2">Where are you going?</label>
      <div v-if="isAddingLocation" class="mb-2 md:mb-0">
        <div class="border p-2">
          <div class="flex flex-col md:flex-row md:justify-between">
            <div class="flex flex-col flex-grow md:pr-2">
              <label for="location-name" class="text-sm italic text-gray-600"
                >Location Name</label
              >
              <input
                type="text"
                id="location-name"
                v-model="location.location"
                class="form-input focus:shadow-outline mb-1 max-w-full"
                placeholder="Mount Washington"
                required
              />
            </div>
            <div class="flex flex-col md:w-1/3">
              <label for="coordinates" class="text-sm italic text-gray-600"
                >Coordinates (Latitude,Longitude)
              </label>
              <input
                type="text"
                id="coordinates"
                v-model="locationCoordinateString"
                class="form-input focus:shadow-outline mb-1 max-w-full"
                placeholder="44.2705,71.30325"
                required
              />
            </div>
          </div>
          <div class="flex flex-col md:flex-row md:justify-between">
            <div class="flex flex-col md:flex-grow md:pr-2">
              <label for="country" class="text-sm italic text-gray-600"
                >Country
              </label>
              <input
                type="text"
                id="country"
                v-model="location.country"
                class="form-input focus:shadow-outline"
                placeholder="United States"
                required
              />
            </div>
            <div class="flex flex-col md:flex-grow md:pr-2">
              <label for="state" class="text-sm italic text-gray-600"
                >State
              </label>
              <input
                type="text"
                id="state"
                v-model="location.state"
                class="form-input focus:shadow-outline"
                placeholder="New Hampshire"
                required
              />
            </div>
            <div class="flex flex-col md:w-1/3">
              <label for="region" class="text-sm italic text-gray-600"
                >Region
              </label>
              <input
                type="text"
                id="region"
                v-model="location.region"
                class="form-input focus:shadow-outline"
                placeholder="White Mountains"
                required
              />
            </div>
          </div>
        </div>
        <div class="text-right mt-2">
          <span class="text-xs italic text-gray-600 mr-2"
            >...or select an existing location?</span
          >
          <button
            class="form-button"
            type="button"
            @click="toggleIsAddingLocation"
          >
            See existing locations
          </button>
        </div>
      </div>
      <div v-else class="mb-2 md:mb-0">
        <LocationSelect
          class="border p-2"
          label="Select a location"
          :pre-selected="location"
          @selectLocation="onLocationChange"
        />
        <div class="text-right mt-2">
          <span class="text-xs italic text-gray-600 mr-2"
            >Location is not listed?</span
          >
          <button
            class="form-button"
            type="button"
            @click="toggleIsAddingLocation"
          >
            Add new location
          </button>
        </div>
      </div>

      <label for="description" class="text-sm italic mt-2 whitespace-pre-wrap"
        >Tour description</label
      >
      <textarea
        name="descripton"
        v-model="tour.description"
        rows="5"
        placeholder="Talk about the nature of the tour, how long it'll take, how hard it is, a link to a map, what you're looking for, etc."
        class="form-input focus:shadow-outline mb-1 resize-none"
      ></textarea>

      <div class="mt-2 md:mt-4 mb-2 md:mb-0 flex justify-between">
        <div>
          <button
            v-if="isEditing"
            type="button"
            :disabled="!currentUserIsCreator"
            class="form-button-red"
            :class="{ 'opacity-50 cursor-not-allowed': !currentUserIsCreator }"
            @click="$emit('delete', tour.id)"
          >
            Delete
          </button>
        </div>
        <div>
          <button
            type="button"
            @click="goBack"
            class="form-button text-gray-600 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isEditing && !currentUserIsCreator"
            class="form-button-green"
            :class="{
              'opacity-50 cursor-not-allowed':
                isEditing && !currentUserIsCreator
            }"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db, firestore } from '@/config/firebase';
import { DateTime } from 'luxon';
import LocationSelect from '@/components/LocationSelect.vue';

export default {
  props: ['title', 'tour'],

  data() {
    return {
      currentUser: {
        uid: ''
      },
      isAddingLocation: false,
      locationCoordinateString: '',
      location: {
        country: '',
        state: '',
        region: '',
        location: '',
        coordinates: ''
      }
    };
  },

  components: { LocationSelect },

  created() {
    // pre-select location filter
    for (var prop in this.location) {
      this.location[prop] = this.tour[prop];
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      const { uid } = currentUser;
      this.currentUser = { uid };
    }
  },

  watch: {
    locationCoordinateString(value) {
      const [lat, lon] = value.split(',').map(c => parseFloat(c));
      if (lat && lon) {
        this.location.coordinates = new firestore.GeoPoint(lat, lon);
      }
    }
  },

  methods: {
    async onFormSubmit(evt) {
      evt.preventDefault();
      // only creator can update
      if (this.isEditing && !this.currentUserIsCreator) {
        return;
      }

      if (this.isAddingLocation) {
        this.tour.locationRef = await this.createNewLocation(this.location);
      }

      // required if locationRef has been resolved to Map
      if (this.tour.locationRef && !this.tour.locationRef.path) {
        this.tour.locationRef = db
          .collection('locations')
          .doc(this.tour.locationRef.id);
      }

      const tourData = Object.assign({}, this.tour, this.location, {
        creatorRef: db.collection('users').doc(this.currentUser.uid)
      });
      this.$emit('save', tourData);
    },
    updatePlannedOn(evt) {
      const dateString = evt.target.value;
      if (dateString.length < 10) {
        return;
      }
      // localized date input
      const date = DateTime.fromISO(dateString).toJSDate();
      this.tour.plannedOn = firestore.Timestamp.fromDate(date);
    },
    goBack() {
      this.$router.go(-1);
    },
    toggleIsAddingLocation() {
      this.isAddingLocation = !this.isAddingLocation;
      Object.keys(this.location).forEach(prop => {
        this.location[prop] = '';
      });
      this.locationCoordinateString = '';
    },
    onLocationChange(selectedLocation) {
      Object.assign(this.location, selectedLocation);
      const locationKeys = Object.keys(selectedLocation);

      if (locationKeys.length === 4) {
        // query location reference
        const locationQuery = db
          .collection('locations')
          .where('country', '==', selectedLocation.country)
          .where('state', '==', selectedLocation.state)
          .where('region', '==', selectedLocation.region)
          .where('name', '==', selectedLocation.location);

        locationQuery
          .get()
          .then(snapshot => {
            if (!snapshot.empty) {
              const location = snapshot.docs[0];
              const { coordinates } = location.data();
              this.location.coordinates = coordinates;
              this.tour.locationRef = location.ref;
            }
          })
          .catch(error => {
            console.error('Error fetching location: ', error);
          });
      }
    },
    async createNewLocation(location) {
      const locationData = Object.assign({}, location, {
        created: firestore.FieldValue.serverTimestamp(),
        creatorRef: db.collection('users').doc(this.currentUser.uid),
        isVerified: false
      });
      // sligthly confusing: location.name inherits tour.location
      locationData.name = locationData.location;
      delete locationData.location;

      return await db
        .collection('locations')
        .add(locationData)
        .catch(error => {
          console.error('Error adding a new location', error);
        });
    }
  },

  computed: {
    localizedPlannedOn() {
      const { seconds } = this.tour.plannedOn;
      return DateTime.fromSeconds(seconds, {
        zone: 'utc'
      }).toISODate();
    },

    isEditing() {
      return !!this.tour.id;
    },
    currentUserIsCreator() {
      return (
        this.tour.creatorRef && this.tour.creatorRef.id === this.currentUser.uid
      );
    }
  }
};
</script>
