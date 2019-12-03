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

function getBuddiesString(buddies, recipientName) {
  return buddies.filter(buddyName => buddyName !== recipientName).join(', ');
}

function getCommentersString(commentAuthorNames) {
  const uniqueCommenters = Array.from(new Set(commentAuthorNames));
  const hasMultipleCommenters = uniqueCommenters.length > 1;
  if (hasMultipleCommenters) {
    uniqueCommenters.splice(uniqueCommenters.length - 1, 0, 'and');
  }
  const commenterString = uniqueCommenters.join(', ').replace(', and,', ' and');
  return { commenterString, hasMultipleCommenters };
}

function createPersonalization(
  name,
  email,
  dynamicTemplateData,
  buddies,
  commenters
) {
  if (dynamicTemplateData.hasBuddies) {
    dynamicTemplateData.buddies = getBuddiesString(buddies, name);
  }
  if (dynamicTemplateData.hasComments) {
    const { commenterString, hasMultipleCommenters } = getCommentersString(
      commenters
    );
    dynamicTemplateData.commenters = commenterString;
    dynamicTemplateData.hasMultipleCommenters = hasMultipleCommenters;
  }
  return {
    to: [{ name, email }],
    dynamic_template_data: {
      displayName: name,
      ...dynamicTemplateData
    }
  };
}

async function createSgPayload(options) {
  const { doc, db, sendgrid } = options;
  const notification = doc.data();

  const { relatedResourceId: tourId, dynamicTemplateData } = notification;
  const { isBuddyNotification, isCommentNotification } = dynamicTemplateData;

  const tourDoc = await db
    .collection('tours')
    .doc(tourId)
    .get();

  // Load all buddies
  const buddiesColl = await db
    .collection('tours')
    .doc(tourId)
    .collection('buddies')
    .get();
  // eslint-disable-next-line require-atomic-updates
  dynamicTemplateData.hasBuddies = !buddiesColl.empty;

  let creatorDoc = null;
  let allBuddyNames = [];
  if (isBuddyNotification) {
    // compose buddies list
    buddiesColl.forEach(buddy => allBuddyNames.push(buddy.get('displayName')));
    creatorDoc = await tourDoc.get('creatorRef').get();
    allBuddyNames.push(creatorDoc.get('displayName'));
  }

  let commenterNames;
  if (isCommentNotification) {
    const commentsColl = await db
      .collection('tours')
      .doc(tourId)
      .collection('comments')
      .get();
    // eslint-disable-next-line require-atomic-updates
    dynamicTemplateData.hasComments = !commentsColl.empty;

    const commentAuthors = [];
    commentsColl.forEach(doc => {
      commentAuthors.push(doc.get('authorRef').get());
    });
    const authorDocs = await Promise.all(commentAuthors);
    commenterNames = authorDocs.map(d => d.get('displayName'));
  }

  const personalizations = [];

  // tour lead does not receive info notification
  if (isBuddyNotification || isCommentNotification) {
    if (!creatorDoc) {
      creatorDoc = await tourDoc.get('creatorRef').get();
    }

    const creatorProfileDoc = await tourDoc
      .get('creatorRef')
      .collection('private')
      .doc('profile')
      .get();

    personalizations.push(
      createPersonalization(
        creatorDoc.get('displayName'),
        creatorProfileDoc.get('email'),
        dynamicTemplateData,
        allBuddyNames,
        commenterNames
      )
    );
  }

  // buddy notifications
  if (!buddiesColl.empty) {
    buddiesColl.forEach(buddy => {
      personalizations.push(
        createPersonalization(
          buddy.get('displayName'),
          buddy.get('email'),
          dynamicTemplateData,
          allBuddyNames,
          commenterNames
        )
      );
    });
  }

  // delete notification if there's nothing to send
  if (!personalizations.length) {
    return doc.ref.delete();
  }

  return {
    doc,
    payload: {
      from: {
        email: sendgrid.from_email,
        name: sendgrid.from_name
      },
      template_id: sendgrid.templates.tour_update,
      asm: {
        group_id: parseInt(sendgrid.unsubscribe_groups.tour_update, 10) || null
      },
      personalizations
    }
  };
}

async function queueTourUpdate(options) {
  const {
    tourId,
    isBuddyNotification,
    isCommentNotification,
    isInfoNotification,
    db,
    sendgrid,
    created
  } = options;

  const tourDoc = await db
    .collection('tours')
    .doc(tourId)
    .get();

  if (!tourDoc.exists) {
    return;
  }

  const dynamicTemplateData = {
    tourUrl: `https://backcountrybuddy.org/tours/${tourId}`,
    tourTitle: tourDoc.get('title')
  };

  if (isBuddyNotification) {
    dynamicTemplateData.isBuddyNotification = true;
  }

  if (isCommentNotification) {
    dynamicTemplateData.isCommentNotification = true;
  }

  if (isInfoNotification) {
    dynamicTemplateData.isInfoNotification = true;
  }

  const sendgridPayload = {
    from: {
      email: sendgrid.from_email,
      name: sendgrid.from_name
    },
    template_id: sendgrid.templates.tour_update,
    asm: {
      group_id: parseInt(sendgrid.unsubscribe_groups.tour_update, 10) || null
    }
  };

  const notification = {
    type: 'tour-update',
    relatedResourceId: tourId,
    isSent: false,
    sendgridPayload,
    created,
    dynamicTemplateData
  };

  const existingNotficationQuery = await db
    .collection('notifications')
    .where('type', '==', 'tour-update')
    .where('relatedResourceId', '==', tourId)
    .where('isSent', '==', false)
    .orderBy('created', 'desc')
    .limit(1)
    .get();

  if (existingNotficationQuery.empty) {
    return await db.collection('notifications').add(notification);
  }

  // merge dynamic template data
  const existingNotificationDoc = existingNotficationQuery.docs[0];
  const existingDynamicTemplateData = existingNotificationDoc.get(
    'dynamicTemplateData'
  );
  notification.dynamicTemplateData = {
    ...existingDynamicTemplateData,
    ...dynamicTemplateData
  };
  return await existingNotificationDoc.ref.update(notification);
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
  sendNotification,
  createSgPayload
};
