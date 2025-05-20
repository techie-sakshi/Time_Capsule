// pages/api/send-reminders.js
import admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

// 1. Initialize Admin SDK (once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}
const db = admin.firestore();

// 2. Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  try {
    const now = admin.firestore.Timestamp.now();
    const in24h = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    // 3. Query capsules needing reminders
    const snap = await db
      .collection('capsules')
      .where('unlockDate', '>=', now)
      .where('unlockDate', '<=', in24h)
      .where('reminderSent', '==', false)
      .get();

    // 4. Send an email per capsule and update flag
    const ops = snap.docs.map(async (doc) => {
      const { userId, message, unlockDate } = doc.data();
      const user = await admin.auth().getUser(userId);

      await sgMail.send({
        to: user.email,
        from: 'noreply@yourdomain.com',
        subject: '⏳ Your Time Capsule Unlocks Soon!',
        text: `Hi ${user.displayName||''},\n\nYour capsule unlocking on ${unlockDate.toDate().toLocaleString()} has this message:\n\n"${message}"\n\n— TimeCapsule`,
      });

      return doc.ref.update({ reminderSent: true });
    });

    await Promise.all(ops);
    return res.status(200).json({ sent: ops.length });
  } catch (err) {
    console.error('Error sending reminders:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
