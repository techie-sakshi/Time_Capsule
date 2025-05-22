// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import '../app/globals.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/"); // Redirect after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--background-color)",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="rounded-lg shadow-lg border border-[var(--primary-color)] bg-[rgba(255,255,255,0.05)]"
        style={{
          width: "320px",
          padding: "24px",
          animation: "glow 4s infinite",
          boxSizing: "border-box",
          color: "var(--text-color)",
          fontFamily: "'Courier New', monospace",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {isLogin ? "Login" : "Sign Up"} to TimeCapsule
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--primary-color)",
              backgroundColor: "transparent",
              color: "var(--text-color)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--primary-color)",
              backgroundColor: "transparent",
              color: "var(--text-color)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            className="submit-btn"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              background: "linear-gradient(45deg, var(--primary-color), var(--secondary-color))",
              color: "var(--background-color)",
              boxSizing: "border-box",
              transition: "transform 0.3s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
          {error && (
            <p
              style={{
                color: "red",
                fontSize: "0.8rem",
                textAlign: "center",
                wordBreak: "break-word",
                marginTop: "4px",
                boxSizing: "border-box",
              }}
            >
              {error}
            </p>
          )}
        </form>
        <p style={{ marginTop: "16px", textAlign: "center", fontSize: "0.9rem" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              marginLeft: "8px",
              background: "none",
              border: "none",
              color: "var(--primary-color)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.9rem",
              fontFamily: "'Courier New', monospace",
              padding: 0,
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
