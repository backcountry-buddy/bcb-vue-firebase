const functions = require('firebase-functions');
const admin = require('firebase-admin');
const notifications = require('./notifications');
admin.initializeApp();

const db = admin.firestore();

// create parent docs, if they don't exist
exports.createLocationParents = functions.firestore
  .document('locations/{locationId}')
  .onCreate(snap => {
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
    notifications.notifySiteOwner(
      { subject, text },
      functions.config().sendgrid.api_key,
      functions.config().site_owner.email
    );

    return Promise.all(queries);
  });

// Buddy counts
exports.incrementBuddyCount = functions.firestore
  .document('tours/{tourId}/buddies/{buddyId}')
  .onCreate(async (snap, context) => {
    const tourId = context.params.tourId;
    const nrBuddies = admin.firestore.FieldValue.increment(1);
    notifications.queueTourUpdate({
      tourId,
      isBuddyNotification: true,
      db,
      sendgrid: functions.config().sendgrid,
      created: admin.firestore.FieldValue.serverTimestamp()
    });
    return await db
      .collection('tours')
      .doc(tourId)
      .update({ nrBuddies });
  });
exports.decrementBuddyCount = functions.firestore
  .document('tours/{tourId}/buddies/{buddyId}')
  .onDelete(async (snap, context) => {
    const tourId = context.params.tourId;
    const nrBuddies = admin.firestore.FieldValue.increment(-1);
    notifications.queueTourUpdate({
      tourId,
      isBuddyNotification: true,
      db,
      sendgrid: functions.config().sendgrid,
      created: admin.firestore.FieldValue.serverTimestamp()
    });
    return await db
      .collection('tours')
      .doc(tourId)
      .update({ nrBuddies });
  });

// create user profile with a default displayName on user signup
exports.createUserProfile = functions.auth.user().onCreate(async user => {
  const { uid, email } = user;
  const publicProfile = {
    displayName: `${email.split('@')[0]}`
  };
  const privateProfile = { email, uid };
  const subject = 'Backcountry Buddy user signed up';
  const text = `${email}, https://backcountrybuddy.org/users/${uid}`;
  notifications.notifySiteOwner(
    { subject, text },
    functions.config().sendgrid.api_key,
    functions.config().site_owner.email
  );

  await db
    .collection('users')
    .doc(uid)
    .set(publicProfile);
  return db
    .collection('users')
    .doc(uid)
    .collection('private')
    .doc('profile')
    .set(privateProfile);
});

// cron function, runs every day at 7pm
exports.sendTourUpdates = functions.pubsub
  .schedule('0 19 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    // query unsent notifications
    const query = db.collection('notifications').where('isSent', '==', false);
    const unsentNotifications = await query.get();

    const sgApiKey = functions.config().sendgrid.api_key;

    const sgRequests = [];

    // FIXME: possibly more than one notification for the same tour created,
    // due to async nature of firebase functions. should we de-duplicate here?
    unsentNotifications.forEach(doc => {
      const sendgridPayload = doc.get('sendgridPayload');
      // send email
      sgRequests.push(
        notifications
          .sendNotification(sendgridPayload, sgApiKey)
          .then(([response, body]) => {
            const { statusCode } = response;
            const sendgridResponse = { statusCode };
            if (body) {
              sendgridResponse.body = body;
            }
            doc.ref.update({
              isSent: true,
              sendgridResponse,
              modified: admin.firestore.FieldValue.serverTimestamp()
            });
          })
          .catch(e => {
            const { code, message, response } = e;
            const sendgridResponse = { code, message };
            if (response) {
              sendgridResponse.response = response;
            }
            doc.ref.update({
              isSent: false,
              sendgridResponse,
              modified: admin.firestore.FieldValue.serverTimestamp()
            });
          })
      );
    });
    return Promise.all(sgRequests);
  });
