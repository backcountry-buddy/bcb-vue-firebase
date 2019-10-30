const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
admin.initializeApp();

const db = admin.firestore();

function notifySiteOwner(msgOptions) {
  const sgApiKey = functions.config().sendgrid.api_key;
  sgMail.setApiKey(sgApiKey);
  const siteOwnerEmail = functions.config().site_owner.email
  const msg = {
    to: siteOwnerEmail,
    from: 'firebase-function@backcountrybuddy.com'
  };
  Object.assign(msg, msgOptions);
  sgMail.send(msg);
}

// create parent docs, if they don't exist
exports.createLocationParents = functions.firestore
  .document('locations/{locationId}')
  .onCreate((snap, context) => {
    const location = snap.data();
    let parents = [
      {
        prop: 'country',
        coll: 'countries'
      },
      {
        prop: 'state',
        coll: 'states'
      },
      {
        prop: 'region',
        coll: 'regions'
      }
    ];
    const queries = parents.map(parent => {
      const { coll, prop } = parent;
      if (!location[prop]) {
        return Promise.resolve();
      }
      const query = db.collection(coll).where('name', '==', location[prop]);
      return query
        .get()
        .then(querySnapshot => {
          if (querySnapshot.empty) {
            const payload = {
              name: location[prop]
            };
            if (['state', 'region'].includes(prop)) {
              payload.country = location.country;
            }
            if (prop === 'region') {
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

    const subject = 'Backcountry Buddy new location';
    const { country, state, region, name, coordinates } = location;
    const text = `${country} > ${state} > ${region} > ${name} > ${coordinates.longitude},${coordinates.latitude}`;
    notifySiteOwner({subject, text});

    return Promise.all(queries);
  });

// Buddy counts
exports.incrementBuddyCount = functions.firestore
  .document('tours/{tourId}/buddies/{buddyId}')
  .onCreate((snap, context) => {
    const tourId = context.params.tourId;
    const nrBuddies = admin.firestore.FieldValue.increment(1);
    return db
      .collection('tours')
      .doc(tourId)
      .update({ nrBuddies });
  });
exports.decrementBuddyCount = functions.firestore
  .document('tours/{tourId}/buddies/{buddyId}')
  .onDelete((snap, context) => {
    const tourId = context.params.tourId;
    const nrBuddies = admin.firestore.FieldValue.increment(-1);
    return db
      .collection('tours')
      .doc(tourId)
      .update({ nrBuddies });
  });

// create user profile with a default displayName on user signup
exports.createUserProfile = functions.auth.user().onCreate(user => {
  const { uid, email } = user;
  const profile = {
    displayName: `${email.split('@')[0]}`
  };
  
  const subject = 'Backcountry Buddy user signed up';
  const text = `${email}, https://backcountrybuddy.org/users/${uid}`;
  notifySiteOwner({subject, text});

  return db
    .collection('users')
    .doc(uid)
    .set(profile);
});
