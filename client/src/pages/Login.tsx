import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { AnimatedBackground } from "../components/AnimatedBackground";

export function Login() {
  const { login, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function validate(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length < 2) return "Username must be at least 2 characters";
    if (trimmed.length > 20) return "Username must be 20 characters or less";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(username.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatedBackground>
      <div className="bg-[#0f0f23] min-h-screen flex items-center justify-center p-4">
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
                <circle cx="28" cy="28" r="24" stroke="#FFD600" strokeWidth="2.5" fill="none" />
                <path
                  d="M14 28 C20 14, 36 14, 42 28 C36 42, 20 42, 14 28Z"
                  stroke="#FFD600"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="28" cy="28" r="2" fill="#FFD600" />
              </svg>
            </motion.div>

            <h1
              className="text-4xl font-black mb-2"
              style={{
                color: "#FFD600",
                textShadow: "0 0 20px rgba(255,214,0,0.3), 0 0 60px rgba(255,214,0,0.1)",
              }}
            >
              CrickMind
            </h1>
            <p className="text-white/40 text-sm">The Ultimate Cricket Quiz</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your username"
                className="input-glass"
                maxLength={20}
                disabled={submitting}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {error}
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
