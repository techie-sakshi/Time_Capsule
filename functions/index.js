const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Replace with your email credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",       // ✅ Replace with your Gmail
    pass: "your-app-password",          // ✅ Use App Password (not your real Gmail password)
  },
});

exports.sendReminderEmails = functions.pubsub
  .schedule("every 60 minutes")
  .timeZone("UTC")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const oneDayFromNow = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000);

    const snapshot = await db.collection("capsules")
      .where("reminderSent", "==", false)
      .get();

    const updates = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const unlockDate = data.unlockDate.toDate();
      const diffHours = Math.abs((unlockDate - oneDayFromNow) / 36e5); // 36e5 = 60*60*1000

      if (diffHours < 1) {
        const userRef = await admin.auth().getUser(data.userId);
        const email = userRef.email;

        const mailOptions = {
          from: "TimeCapsule Reminder <your-email@gmail.com>",
          to: email,
          subject: "⏳ Your time capsule unlocks tomorrow!",
          text: `Hey there! Just a reminder that your time capsule will unlock on ${unlockDate.toLocaleString()}. Check it soon!`,
        };

        await transporter.sendMail(mailOptions);

        updates.push(doc.ref.update({ reminderSent: true }));
      }
    }

    await Promise.all(updates);
    console.log(`Sent ${updates.length} reminder emails.`);
    return null;
  });
