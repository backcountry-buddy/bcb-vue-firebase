<template>
  <div class="mt-4">
    <form @submit="onFormSubmit" class="flex flex-col">
      <h2 class="text-lg font-light flex justify-between mb-4">
        <span class="flex-grow">Post a new tour</span>
        <button
          type="button"
          @click="browserBack"
          class="form-button text-gray-600 mr-2"
        >
          Cancel
        </button>
        <button type="submit" class="form-button">Save tour</button>
      </h2>

      <div class="flex justify-between mb-2">
        <div class="flex flex-col flex-grow mr-2">
          <label for="title" class="text-sm italic mt-2">Title </label>
          <input
            type="text"
            id="title"
            v-model="tour.title"
            class="form-input-sm focus:shadow-outline"
            placeholder="Skinning up the Sherburne Trail"
          />
        </div>
        <div class="flex flex-col">
          <label for="planned-on" class="text-sm italic mt-2">When?</label>
          <input
            type="date"
            id="planned-on"
            :value="localizedPlannedOn"
            @input="updatePlannedOn"
            class="form-input-sm focus:shadow-outline"
          />
        </div>
      </div>

      <label class="text-sm italic mt-2">Where?</label>
      <div v-if="isAddingLocation">
        <div class="border p-2">
          <div class="flex justify-between">
            <div class="flex flex-col flex-grow pr-2">
              <label for="location" class="text-sm italic text-gray-600"
                >Location Name</label
              >
              <input
                type="text"
                id="location"
                v-model="tour.location"
                class="form-input-sm focus:shadow-outline mb-1 max-w-full"
                placeholder="Mount Washington"
              />
            </div>
            <div class="flex flex-col w-1/3">
              <label for="coordinates" class="text-sm italic text-gray-600"
                >Coordinates (Latitude,Longitude)
              </label>
              <input
                type="text"
                id="coordinates"
                v-model="tour.coordinates"
                class="form-input-sm focus:shadow-outline mb-1 max-w-full"
                placeholder="44.2705,71.30325"
              />
            </div>
          </div>
          <div class="flex justify-betwee">
            <div class="flex flex-col flex-grow pr-2">
              <label for="country" class="text-sm italic text-gray-600"
                >Country
              </label>
              <input
                type="text"
                id="country"
                v-model="tour.country"
                class="form-input-sm focus:shadow-outline"
                placeholder="United States"
              />
            </div>
            <div class="flex flex-col flex-grow pr-2">
              <label for="state" class="text-sm italic text-gray-600"
                >State
              </label>
              <input
                type="text"
                id="state"
                v-model="tour.state"
                class="form-input-sm focus:shadow-outline"
                placeholder="New Hampshire"
              />
            </div>
            <div class="flex flex-col w-1/3">
              <label for="region" class="text-sm italic text-gray-600"
                >Region
              </label>
              <input
                type="text"
                id="region"
                v-model="tour.region"
                class="form-input-sm focus:shadow-outline"
                placeholder="White Mountains"
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
      <div v-else>
        <!-- TODO: allow location props to preset dropdowns -->
        <LocationSelect
          class="border p-2"
          label=""
          @selectLocation="onLocationChange"
        />
        <div class="text-right mt-2">
          <span class="text-xs italic text-gray-600 mr-2"
            >Can't find your location?</span
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

      <!-- TODO: allow markdown -->
      <label for="description" class="text-sm italic mt-2">Description</label>
      <textarea
        name="descripton"
        v-model="tour.description"
        rows="5"
        placeholder="Talk about the nature of the tour, how long it'll take, how hard it is, a link to a map, what you're looking for, etc."
        class="form-input-sm focus:shadow-outline mb-1 resize-none"
      ></textarea>

      <div class="text-right mt-4">
        <button
          type="button"
          @click="browserBack"
          class="form-button text-gray-600 mr-2"
        >
          Cancel
        </button>
        <button type="submit" class="form-button">Save tour</button>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db, firestore } from "@/config/firebase";
import { DateTime } from "luxon";
import LocationSelect from "@/components/LocationSelect.vue";

export default {
  data() {
    return {
      currentUser: {
        uid: ""
      },
      isAddingLocation: false,
      tour: {
        description: "",
        country: "United States",
        state: "",
        region: "",
        location: "",
        coordinates: "",
        locationRef: "",
        plannedOn: DateTime.local().toSeconds(),
        creatorRef: "",
        created: ""
      }
    };
  },

  components: { LocationSelect },

  created() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }
    const { uid } = currentUser;
    this.currentUser = { uid };
  },

  methods: {
    async onFormSubmit(evt) {
      evt.preventDefault();

      if (this.isAddingLocation) {
        const {
          country,
          state,
          region,
          location: name,
          coordinates
        } = this.tour;
        const [lat, lon] = coordinates.split(",").map(c => parseFloat(c));
        this.tour.locationRef = await this.createNewLocation({
          country,
          state,
          region,
          name,
          lat,
          lon
        });
      }

      const tourData = Object.assign({}, this.tour, {
        plannedOn: firestore.Timestamp.fromDate(
          DateTime.fromSeconds(this.tour.plannedOn).toJSDate()
        ),
        created: firestore.FieldValue.serverTimestamp(),
        creatorRef: db.collection("users").doc(this.currentUser.uid)
      });

      await db
        .collection("tours")
        .add(tourData)
        .catch(function(error) {
          console.error("Error saving a new tour: ", error);
        });
      this.$router.push({ name: "home" });
    },
    updatePlannedOn(evt) {
      this.tour.plannedOn = DateTime.fromISO(evt.target.value).toSeconds();
    },
    browserBack() {
      this.$router.go(-1);
    },
    toggleIsAddingLocation() {
      this.isAddingLocation = !this.isAddingLocation;
      this.tour.country = "";
      this.tour.state = "";
      this.tour.region = "";
      this.tour.location = "";
      this.tour.coordinates = "";
    },
    onLocationChange(location) {
      Object.assign(this.tour, location);
      const locationKeys = Object.keys(location);

      if (locationKeys.length === 4) {
        // query location reference
        const locationQuery = db
          .collection("locations")
          .where("country", "==", location.country)
          .where("state", "==", location.state)
          .where("region", "==", location.region)
          .where("name", "==", location.location);

        locationQuery
          .get()
          .then(snapshot => {
            if (!snapshot.empty) {
              const location = snapshot.docs[0];
              const { coordinates } = location.data();
              this.tour.coordinates = coordinates;
              this.tour.locationRef = location.ref;
            }
          })
          .catch(error => {
            console.warn(error);
          });
      }
    },
    async createNewLocation(locationData) {
      const { country, state, region, name, lat, lon } = locationData;
      return await db
        .collection("locations")
        .add({
          country,
          state,
          region,
          name,
          coordinates: new firestore.GeoPoint(lat, lon),
          created: firestore.FieldValue.serverTimestamp(),
          creatorRef: db.collection("users").doc(this.currentUser.uid)
        })
        .catch(error => {
          console.error("Error adding a new location", error);
        });
    }
  },

  computed: {
    localizedPlannedOn() {
      return DateTime.fromSeconds(this.tour.plannedOn, {
        zone: "utc"
      }).toISODate();
    }
  }
};
</script>
