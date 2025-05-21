// pages/api/sendReminder.js
import { db } from "@/lib/firebase"; // ✅ Reuse existing Firestore instance
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import sgMail from "@sendgrid/mail";

// ✅ SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const snapshot = await getDocs(collection(db, "capsules"));
    const reminders = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const unlockDate = new Date(data.unlockDate);

      if (
        unlockDate <= nextDay &&
        !data.reminderSent &&
        data.userEmail // Required
      ) {
        const msg = {
          to: data.userEmail,
          from: {
            email: "timecapsule604@gmail.com",
            name: "TimeCapsule App",
          },
          subject: "⏳ Your TimeCapsule is unlocking soon!",
          text: `Hey! Your TimeCapsule titled "${data.title}" will unlock on ${unlockDate.toDateString()}.`,
        };

        reminders.push(
          sgMail.send(msg).then(() =>
            updateDoc(doc(db, "capsules", docSnap.id), {
              reminderSent: true,
            })
          )
        );
      }
    });

    await Promise.all(reminders);
    res.status(200).json({ message: "Reminders sent!" });
  } catch (err) {
    console.error("Reminder email error:", err);
    res.status(500).json({ error: "Failed to send reminders" });
  }
}
