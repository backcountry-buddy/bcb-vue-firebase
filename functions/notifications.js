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

function getCommentersString(commentAuthorNames, recipientName) {
  const uniqueCommenters = Array.from(new Set(commentAuthorNames)).filter(
    commenterName => commenterName !== recipientName
  );
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
      commenters,
      name
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

async function createDeleteSgPayload(options) {
  const { doc, db, sendgrid } = options;
  const notification = doc.data();

  const {
    relatedResourceId: tourId,
    dynamicTemplateData: { tourTitle }
  } = notification;

  const dynamicTemplateData = {
    tourTitle,
    isDeleteNotification: true
  };

  const documentsToDelete = [];

  const commentsColl = await db
    .collection('tours')
    .doc(tourId)
    .collection('comments')
    .get();

  if (!commentsColl.empty) {
    commentsColl.forEach(commentDoc => {
      documentsToDelete.push(commentDoc.ref.delete());
    });
  }

  const buddiesColl = await db
    .collection('tours')
    .doc(tourId)
    .collection('buddies')
    .get();

  const personalizations = [];

  if (!buddiesColl.empty) {
    buddiesColl.forEach(buddyDoc => {
      personalizations.push(
        createPersonalization(
          buddyDoc.get('displayName'),
          buddyDoc.get('email'),
          dynamicTemplateData
        )
      );
      documentsToDelete.push(buddyDoc.ref.delete());
    });
  }

  await Promise.all(documentsToDelete);

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

async function createSgPayload(options) {
  const { doc, db, sendgrid } = options;
  const notification = doc.data();

  const { relatedResourceId: tourId, dynamicTemplateData } = notification;
  const {
    isBuddyNotification,
    isCommentNotification,
    isDeleteNotification
  } = dynamicTemplateData;

  if (isDeleteNotification) {
    return await createDeleteSgPayload(options);
  }

  // what if tourDoc does not exist anymore?
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
    buddiesColl.forEach(buddyDoc =>
      allBuddyNames.push(buddyDoc.get('displayName'))
    );
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
    commentsColl.forEach(commentDoc => {
      commentAuthors.push(commentDoc.get('authorRef').get());
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

    const privateProfileQuerySnapshot = await tourDoc
      .get('creatorRef')
      .collection('private')
      .where('type', '==', 'privateUserProfile')
      .get();

    const creatorProfileDoc = privateProfileQuerySnapshot.docs[0];

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
    buddiesColl.forEach(buddyDoc => {
      personalizations.push(
        createPersonalization(
          buddyDoc.get('displayName'),
          buddyDoc.get('email'),
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
    tourTitle,
    isBuddyNotification,
    isCommentNotification,
    isInfoNotification,
    isDeleteNotification,
    db,
    sendgrid,
    created
  } = options;

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
    created
  };

  const dynamicTemplateData = {
    tourUrl: `https://backcountrybuddy.org/tours/${tourId}`,
    tourTitle
  };

  if (isDeleteNotification) {
    dynamicTemplateData.isDeleteNotification = true;
    notification.dynamicTemplateData = dynamicTemplateData;

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
    const existingNotificationDoc = existingNotficationQuery.docs[0];
    return await existingNotificationDoc.ref.update(notification);
  }

  const tourDoc = await db
    .collection('tours')
    .doc(tourId)
    .get();

  if (!tourDoc.exists) {
    return;
  }

  dynamicTemplateData.tourTitle = tourDoc.get('title');

  if (isBuddyNotification) {
    dynamicTemplateData.isBuddyNotification = true;
  }

  if (isCommentNotification) {
    dynamicTemplateData.isCommentNotification = true;
  }

  if (isInfoNotification) {
    dynamicTemplateData.isInfoNotification = true;
  }

  notification.dynamicTemplateData = dynamicTemplateData;

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
