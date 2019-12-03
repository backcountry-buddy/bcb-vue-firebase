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
    await notifications.queueTourUpdate({
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
    await notifications.queueTourUpdate({
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

exports.createTourCommentNotification = functions.firestore
  .document('tours/{tourId}/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const tourId = context.params.tourId;
    return await notifications.queueTourUpdate({
      tourId,
      isCommentNotification: true,
      db,
      sendgrid: functions.config().sendgrid,
      created: admin.firestore.FieldValue.serverTimestamp()
    });
  });

exports.createTourInfoNotification = functions.firestore
  .document('tours/{tourId}')
  .onUpdate(async (change, context) => {
    // exit if tour was deleted
    // TODO: handle tour deletion
    if (!change.after.exists) {
      return null;
    }

    const propsHaveChanged = [
      'description',
      'location',
      'plannedOn',
      'title'
    ].reduce((acc, propName) => {
      let propHasChanged;
      if (propName === 'plannedOn') {
        propHasChanged =
          change.before.get(propName).seconds !==
          change.after.get(propName).seconds;
      } else {
        propHasChanged =
          change.before.get(propName) !== change.after.get(propName);
      }
      return propHasChanged || acc;
    }, false);

    if (propsHaveChanged) {
      const tourId = context.params.tourId;
      return await notifications.queueTourUpdate({
        tourId,
        isInfoNotification: true,
        db,
        sendgrid: functions.config().sendgrid,
        created: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    return null;
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
    const unsentNotifications = await db
      .collection('notifications')
      .where('isSent', '==', false)
      .where('type', '==', 'tour-update')
      .get();

    const sgApiKey = functions.config().sendgrid.api_key;
    const sendgrid = functions.config().sendgrid;
    const sgPayloadPromises = [];

    unsentNotifications.forEach(doc => {
      sgPayloadPromises.push(
        notifications.createSgPayload({ doc, db, sendgrid })
      );
    });

    const sgPayloads = await Promise.all(sgPayloadPromises);

    const sgRequests = [];
    sgPayloads.forEach(options => {
      if (!options) return;
      const { doc, payload } = options;
      sgRequests.push(
        notifications
          .sendNotification(payload, sgApiKey)
          .then(([response, body]) => {
            const { statusCode } = response;
            const sendgridResponse = { statusCode };
            if (body) {
              sendgridResponse.body = body;
            }
            doc.ref.update({
              isSent: true,
              sendgridResponse,
              sendgridPayload: payload,
              modified: admin.firestore.FieldValue.serverTimestamp()
            });
          })
          .catch(e => {
            if (!doc) return;
            const { code, message, response } = e;
            const sendgridResponse = { code, message };
            if (response) {
              sendgridResponse.response = response;
            }
            doc.ref.update({
              isSent: false,
              hasError: true,
              sendgridResponse,
              sendgridPayload: payload,
              modified: admin.firestore.FieldValue.serverTimestamp()
            });
          })
      );
    });

    return Promise.all(sgRequests);
  });
