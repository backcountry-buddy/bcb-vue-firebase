const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// create parent docs, if they don't exist
exports.createLocationParents = functions.firestore
  .document("locations/{locationId}")
  .onCreate((snap, context) => {
    const location = snap.data();
    let parents = [
      {
        prop: "country",
        coll: "countries"
      },
      {
        prop: "state",
        coll: "states"
      },
      {
        prop: "region",
        coll: "regions"
      }
    ];
    const queries = parents.map(parent => {
      const { coll, prop } = parent;
      if (!location[prop]) {
        return Promise.resolve();
      }
      const query = db.collection(coll).where("name", "==", location[prop]);
      return query
        .get()
        .then(querySnapshot => {
          if (querySnapshot.empty) {
            const payload = {
              name: location[prop]
            };
            if (["state", "region"].includes(prop)) {
              payload.country = location.country;
            }
            if (prop === "region") {
              payload.state = location.state;
            }
            return db.collection(coll).add(payload);
          }
          return querySnapshot;
        })
        .catch(error => {
          console.error(error);
        });
    });
    return Promise.all(queries);
  });