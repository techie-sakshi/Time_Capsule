// dashboard.js
import '../app/globals.css';
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import axios from "axios";
import Countdown from "react-countdown";
import {
  FaHome,
  FaPlusCircle,
  FaSignOutAlt,
  FaChartBar,
} from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [capsules, setCapsules] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOption, setSortOption] = useState("unlockDesc");
  const [tagsInput, setTagsInput] = useState("");

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentDay, setCurrentDay] = useState("");

  const CLOUD_NAME = "dfp9nnzgm";
  const UPLOAD_PRESET = "timecapsule_unsigned";

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(
        now.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      );
      setCurrentDay(now.toLocaleDateString(undefined, { weekday: "long" }));
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/login");
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "capsules"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const capsule = d.data();
        return {
          id: d.id,
          ...capsule,
          unlockDate: capsule.unlockDate?.toDate?.() || new Date(),
          createdAt: capsule.createdAt?.toDate?.() || new Date(),
        };
      });
      setCapsules(data);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const uploadToCloudinary = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        form
      );
      return { url: res.data.secure_url, type: res.data.resource_type };
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!message.trim() || !unlockDate) {
      setStatus("Please fill all fields.");
      return;
    }
    let media = { url: "", type: "" };
    if (file) {
      const up = await uploadToCloudinary(file);
      if (!up) return setStatus("❌ Failed to upload file.");
      media = up;
    }
    const tagsArray = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length);
    try {
      await addDoc(collection(db, "capsules"), {
        userId: user.uid,
        message,
        unlockDate: Timestamp.fromDate(new Date(unlockDate)),
        fileURL: media.url,
        fileType: media.type,
        tags: tagsArray,
        createdAt: serverTimestamp(),
        reminderSent: false,
      });
      setMessage(""); setUnlockDate(""); setFile(null); setTagsInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus("✅ Capsule created!");
    } catch {
      setStatus("❌ Error saving capsule.");
    }
  };

  const isUnlocked = (capsule) => capsule.unlockDate.getTime() <= Date.now();

  const filtered = capsules
    .filter(c => c.message.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => {
      const unlocked = isUnlocked(c);
      if (filterStatus === 'locked') return !unlocked;
      if (filterStatus === 'unlocked') return unlocked;
      return true;
    });

  filtered.sort((a, b) => {
    const ua = a.unlockDate.getTime();
    const ub = b.unlockDate.getTime();
    const ca = a.createdAt.getTime();
    const cb = b.createdAt.getTime();
    switch (sortOption) {
      case 'unlockAsc': return ua - ub;
      case 'unlockDesc': return ub - ua;
      case 'createdAsc': return ca - cb;
      case 'createdDesc': return cb - ca;
      default: return 0;
    }
  });
  const total = capsules.length;
  const unlocked = capsules.filter(isUnlocked).length;
  const locked = total - unlocked;
  const nextDate = capsules
    .filter(c => !isUnlocked(c))
    .sort((a, b) => a.unlockDate - b.unlockDate)[0]?.unlockDate
    .toLocaleString() || "None";

  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-left">
          <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><FaHome /> Dashboard</div>
          <div className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}><FaPlusCircle /> Create</div>
          <div
          className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        ><FaChartBar /> Analytics</div>
        </div>
        

        <div className="navbar-right">
          <div className="date-time">{currentDay}, {currentDate}<br />{currentTime}</div>
          <div className="nav-link" onClick={handleLogout}><FaSignOutAlt /> Logout</div>
        </div>
      </div>

      {
        activeTab === 'dashboard' && (
          <div className="time-machine">
            <h1 className="welcome-message">{user ? `Hello, ${user.displayName || user.email} Welcome to TimeCapsule - where your memories wait patiently for the perfect moment.` : 'Loading...'}</h1>
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded"
              />

              <div className="flex items-center gap-2">
                <label className="font-medium">Filter:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border p-2 rounded"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                >
                  <option value="all">All</option>
                  <option value="locked">Locked</option>
                  <option value="unlocked">Unlocked</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-medium">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border p-2 rounded"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                >
                  <option value="unlockDesc">Unlock Date ↓</option>
                  <option value="unlockAsc">Unlock Date ↑</option>
                  <option value="createdDesc">Created ↓</option>
                  <option value="createdAsc">Created ↑</option>
                </select>
              </div>
            </div>

            <div className="message-list mt-4">
              {filtered.length === 0 && <p>No capsules found.</p>}
              {filtered.map(cap => (
                <div key={cap.id} className="message-card mb-4">
                  <div><strong>Unlocks on:</strong> {cap.unlockDate.toLocaleString()}</div>
                  <div className="capsule-meta"><small>Created on: {cap.createdAt.toLocaleString()}</small></div>
                  <div className="countdown-timer">
                    {isUnlocked(cap) ? 'Unlocked!' : <Countdown date={cap.unlockDate} />}
                  </div>
                  {isUnlocked(cap) ? (
                    <>
                      <p>{cap.message}</p>
                      {cap.tags?.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {cap.tags.map(tag => (
                            <span key={tag} onClick={() => setSearchTerm(tag)} className="px-2 py-1 bg-gray-200 rounded cursor-pointer text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {cap.fileURL && (
                        cap.fileType === 'image' ? (
                          <img src={cap.fileURL} alt="Attached" className="w-full mt-2 rounded" />
                        ) : (
                          <a href={cap.fileURL} target="_blank" rel="noopener noreferrer" className="underline">View File</a>
                        )
                      )}
                    </>
                  ) : (
                    <div className="italic text-gray-400 mt-2">
                      🔒 This capsule is locked. Message and media will be available after unlock time.
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )
      }

      {
        activeTab === 'create' && (
          <div className="time-machine">
            <h1 className="capsule-header">Write your thoughts today so you can read your journey tomorrow</h1>
            <form onSubmit={handleSubmit} className="capsule-form">
              <div className="form-group">
                <label>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your time capsule message here..." required />
              </div>
              <div className="form-group">
                <label>Unlock Date</label>
                <input type="datetime-local" value={unlockDate} onChange={e => setUnlockDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="e.g. Birthday,Goals" />
              </div>
              <div className="form-group">
                <label>Attach File (optional)</label>
                <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files[0])} accept="image/*,audio/*,video/*" />
              </div>
              <button type="submit" className="submit-btn">Save Capsule</button>
              {status && <p className="status-display mt-2">{status}</p>}
            </form>
          </div>
        )
      }
       {activeTab==='analytics' && (
        <div className="time-machine">
          <h1>Analytics Overview</h1>
          <div className="analytics-cards">
            <div className="analytics-card">
              <h2>Total Capsules</h2><p>{total}</p>
            </div>
            <div className="analytics-card">
              <h2>Unlocked</h2><p>{unlocked}</p>
            </div>
            <div className="analytics-card">
              <h2>Locked</h2><p>{locked}</p>
            </div>
            <div className="analytics-card">
              <h2>Next Unlock</h2><p>{nextDate}</p>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
