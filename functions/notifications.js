const sgMail = require('@sendgrid/mail');
const client = require('@sendgrid/client');

function notifySiteOwner(msgOptions, sgApiKey, siteOwnerEmail) {
  sgMail.setApiKey(sgApiKey);
  const msg = {
    to: siteOwnerEmail,
    from: 'firebase-function@backcountrybuddy.com'
  };
  Object.assign(msg, msgOptions);
  sgMail.send(msg);
}

// update existing personalization with new personalization
function syncPersonalizations(n, e) {
  // we have only 1 recipient per personalization
  const existingEmails = e.map(p => p.to[0].email);
  const emails = n.map(p => p.to[0].email);

  // sync existing personalizations with new ones
  let i = 0;
  while (i < e.length) {
    // update existing personalization
    const existingEmail = e[i].to[0].email;
    // remove existing if not in new
    if (emails.includes(existingEmail)) {
      // update existing with new
      const personalization = n.find(p => p.to[0].email === existingEmail);
      Object.assign(
        e[i].dynamic_template_data,
        personalization.dynamic_template_data
      );
    } else {
      // remove existing
      e.splice(i, 1);
    }
    i++;
  }

  // add any new personalizations
  const addedPersonalizations = n.filter(
    p => !existingEmails.includes(p.to[0].email)
  );
  return [...e, ...addedPersonalizations];
}

async function createBuddyPersonalizations(options) {
  const { emailTplData, db, tourId, tourDoc } = options;

  emailTplData.isBuddyNotification = true;

  const buddiesColl = await db
    .collection('tours')
    .doc(tourId)
    .collection('buddies')
    .get();

  emailTplData.hasBuddies = !buddiesColl.empty;

  const allBuddyNames = [];
  buddiesColl.forEach(buddy => allBuddyNames.push(buddy.get('displayName')));

  // start with tour lead
  const creatorDoc = await tourDoc.get('creatorRef').get();
  const creatorProfileDoc = await tourDoc
    .get('creatorRef')
    .collection('private')
    .doc('profile')
    .get();
  allBuddyNames.push(creatorDoc.get('displayName'));
  const personalizations = [
    {
      to: [
        {
          name: creatorDoc.get('displayName'),
          email: creatorProfileDoc.get('email')
        }
      ],
      dynamic_template_data: {
        displayName: creatorDoc.get('displayName'),
        buddies: allBuddyNames
          .filter(n => n !== creatorDoc.get('displayName'))
          .join(', '),
        ...emailTplData
      }
    }
  ];

  // add tour buddies
  if (emailTplData.hasBuddies) {
    // personalization
    buddiesColl.forEach(buddy => {
      const personalization = {
        to: [
          {
            email: buddy.get('email'),
            name: buddy.get('displayName')
          }
        ],
        dynamic_template_data: {
          displayName: buddy.get('displayName'),
          buddies: allBuddyNames
            .filter(n => n !== buddy.get('displayName'))
            .join(', '),
          ...emailTplData
        }
      };
      personalizations.push(personalization);
    });
  }

  return personalizations;
}

async function queueTourUpdate(options) {
  // isCommentNotification, isInfoNotification
  const { tourId, isBuddyNotification, db, sendgrid, created } = options;

  const emailTplData = {
    tourUrl: `https://backcountrybuddy.org/tours/${tourId}`
  };
  const tourDoc = await db
    .collection('tours')
    .doc(tourId)
    .get();
  if (!tourDoc.exists) {
    return;
  }
  emailTplData.tourTitle = tourDoc.get('title');

  let personalizations = [];

  if (isBuddyNotification) {
    const buddyPersonalizations = await createBuddyPersonalizations({
      emailTplData,
      db,
      tourId,
      tourDoc
    });
    personalizations = [...personalizations, ...buddyPersonalizations];
  }

  const sendgridPayload = {
    from: {
      email: sendgrid.from_email,
      name: sendgrid.from_name
    },
    template_id: sendgrid.templates.tour_update,
    asm: {
      group_id: parseInt(sendgrid.unsubscribe_groups.tour_update, 10) || null
    },
    personalizations
  };

  const notification = {
    type: 'tour-update',
    relatedResourceId: tourId,
    isSent: false,
    sendgridPayload,
    created
  };

  const existingNotficationQuery = await db
    .collection('notifications')
    .where('type', '==', 'tour-update')
    .where('relatedResourceId', '==', tourId)
    .where('isSent', '==', false)
    .limit(1)
    .get();

  if (existingNotficationQuery.empty) {
    db.collection('notifications').add(notification);
  } else {
    const existingNotification = existingNotficationQuery.docs[0].data();
    const {
      sendgridPayload: { personalizations: existingPersonalizations }
    } = existingNotification;
    const {
      sendgridPayload: { personalizations }
    } = notification;

    const updatedPersonalizations = syncPersonalizations(
      personalizations,
      existingPersonalizations
    );

    const docId = existingNotficationQuery.docs[0].id;
    notification.sendgridPayload.personalizations = updatedPersonalizations;
    db.collection('notifications')
      .doc(docId)
      .set(notification);
  }
}

function sendNotification(payload, sgApiKey) {
  client.setApiKey(sgApiKey);
  const request = {
    method: 'POST',
    url: '/v3/mail/send',
    body: payload
  };
  return client.request(request);
}

module.exports = {
  queueTourUpdate,
  notifySiteOwner,
  sendNotification
};
