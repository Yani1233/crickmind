import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { AnimatedBackground } from "../components/AnimatedBackground";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const { login, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function validateEmail(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required";
    if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
    return "";
  }

  function validateName(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length < 2) return "Display name must be at least 2 characters";
    if (trimmed.length > 30) return "Display name must be 30 characters or less";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const eError = validateEmail(email);
    const nError = validateName(displayName);
    setEmailError(eError);
    setNameError(nError);
    if (eError || nError) return;

    setSubmitting(true);

    try {
      await login(email.trim(), displayName.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass-card w-full max-w-md p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -20 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-5xl mb-4 inline-block"
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                className="inline-block"
              >
                <defs>
                  <linearGradient id="ball-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle
                  cx="28" cy="28" r="24"
                  stroke="url(#ball-gradient)"
                  strokeWidth="2.5"
                  fill="none"
                  style={{ filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 16px rgba(6, 182, 212, 0.2))" }}
                />
                <path
                  d="M14 28 C20 14, 36 14, 42 28 C36 42, 20 42, 14 28Z"
                  stroke="url(#ball-gradient)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="28" cy="28" r="2" fill="#8b5cf6" />
              </svg>
            </motion.div>

            <h1 className="text-4xl font-black mb-2 gradient-text">
              CrickMind
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>The Ultimate Cricket Quiz</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="Enter your email"
                className="input-glass"
                disabled={submitting}
              />
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {emailError}
                </motion.p>
              )}
            </div>

            <div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="Choose a display name"
                className="input-glass"
                maxLength={30}
                disabled={submitting}
              />
              {nameError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {nameError}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Connecting..." : "Start Playing"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}
