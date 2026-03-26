import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getUserProfile } from "../api/users";
import { createRoom, joinRoom, getRoomInfo, leaveRoom } from "../api/rooms";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Skeleton } from "../components/Skeleton";

const ROOM_STORAGE_KEY = "crickmind_room";

interface ModeStatEntry {
  highScore: number;
  gamesPlayed: number;
  totalScore: number;
}

interface ProfileData {
  id: string;
  username: string;
  createdAt: string;
  totalScore: number;
  totalGames: number;
  modeStats: Record<string, ModeStatEntry>;
}

interface RoomData {
  code: string;
  members: Array<{ userId: string; username: string }>;
}

const MODE_CONFIG: Array<{ key: string; label: string; emoji: string }> = [
  { key: "who-am-i", label: "Who Am I?", emoji: "\uD83D\uDD0D" },
  { key: "stat-attack", label: "Stat Attack", emoji: "\uD83D\uDCCA" },
  { key: "quick-fire", label: "Quick Fire", emoji: "\u26A1" },
  { key: "higher-or-lower", label: "Higher or Lower", emoji: "\u2696\uFE0F" },
];

const STAGGER_DELAY = 0.08;

function readStoredRoomCode(): string | null {
  try {
    return localStorage.getItem(ROOM_STORAGE_KEY);
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function computeAvgScore(stat: ModeStatEntry): number {
  if (stat.gamesPlayed === 0) return 0;
  return Math.round(stat.totalScore / stat.gamesPlayed);
}

export function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomActionLoading, setRoomActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const userId = user?.id ?? "";
  const username = user?.username ?? "";

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch {
      setProfile({
        id: userId,
        username,
        createdAt: new Date().toISOString(),
        totalScore: 0,
        totalGames: 0,
        modeStats: {},
      });
    } finally {
      setProfileLoading(false);
    }
  }, [userId, username]);

  const fetchRoom = useCallback(async () => {
    const storedCode = readStoredRoomCode();
    if (!storedCode || !userId) {
      setRoom(null);
      return;
    }
    setRoomLoading(true);
    try {
      const data = await getRoomInfo(storedCode);
      setRoom(data);
    } catch {
      localStorage.removeItem(ROOM_STORAGE_KEY);
      setRoom(null);
    } finally {
      setRoomLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchProfile();
    fetchRoom();
  }, [user, navigate, fetchProfile, fetchRoom]);

  function handleLogout() {
    localStorage.removeItem(ROOM_STORAGE_KEY);
    logout();
    navigate("/login", { replace: true });
  }

  async function handleCreateRoom() {
    setRoomActionLoading(true);
    setRoomError("");
    try {
      const data = await createRoom(userId);
      localStorage.setItem(ROOM_STORAGE_KEY, data.code);
      setRoom(data);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setRoomActionLoading(false);
    }
  }

  async function handleJoinRoom() {
    const trimmed = joinCode.trim().toUpperCase();
    if (!trimmed) {
      setRoomError("Enter a room code");
      return;
    }
    setRoomActionLoading(true);
    setRoomError("");
    try {
      const data = await joinRoom(userId, trimmed);
      localStorage.setItem(ROOM_STORAGE_KEY, data.code);
      setRoom(data);
      setJoinCode("");
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setRoomActionLoading(false);
    }
  }

  async function handleLeaveRoom() {
    if (!room) return;
    setRoomActionLoading(true);
    setRoomError("");
    try {
      await leaveRoom(userId, room.code);
      localStorage.removeItem(ROOM_STORAGE_KEY);
      setRoom(null);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "Failed to leave room");
    } finally {
      setRoomActionLoading(false);
    }
  }

  async function handleCopyCode() {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!user) return null;

  return (
    <AnimatedBackground>
      <div className="bg-[#0f0f23] min-h-screen">
        {/* Header */}
        <header
          className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between glass-card"
          style={{
            borderRadius: 0,
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            borderBottom: "1px solid transparent",
            borderImage:
              "linear-gradient(to right, transparent, var(--gold-accent), transparent) 1",
          }}
        >
          <button
            onClick={() => navigate("/")}
            className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1"
          >
            <span>&larr;</span> Hub
          </button>
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Profile
          </h1>
          <div className="w-16" />
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card glow-gold p-6 text-center"
          >
            {profileLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Skeleton variant="circle" />
                <Skeleton className="w-40" />
                <Skeleton className="w-24" />
              </div>
            ) : (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-3"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "var(--text-primary)",
                    boxShadow: "var(--shadow-glow-green)",
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {username}
                </h2>
                <p
                  className="text-xs mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Member since{" "}
                  {formatDate(profile?.createdAt ?? new Date().toISOString())}
                </p>
                <div className="flex justify-center gap-8">
                  <div>
                    <div
                      className="text-3xl font-black"
                      style={{
                        color: "var(--gold-accent)",
                        textShadow: "0 0 16px rgba(255, 214, 0, 0.3)",
                      }}
                    >
                      {profile?.totalScore ?? 0}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Total Score
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-3xl font-black"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {profile?.totalGames ?? 0}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Games Played
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Per-Mode Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {MODE_CONFIG.map((mode, index) => {
              const stat = profile?.modeStats[mode.key];
              const defaultStat: ModeStatEntry = {
                highScore: 0,
                gamesPlayed: 0,
                totalScore: 0,
              };
              const data = stat ?? defaultStat;

              return (
                <motion.div
                  key={mode.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2 + index * STAGGER_DELAY,
                  }}
                  className="glass-card p-4 relative overflow-hidden"
                >
                  <span className="absolute top-2 right-2 text-lg opacity-40">
                    {mode.emoji}
                  </span>
                  <h3
                    className="text-sm font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {mode.label}
                  </h3>
                  {profileLoading ? (
                    <Skeleton count={3} />
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          High Score
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: "var(--gold-accent)",
                            textShadow: "0 0 8px rgba(255, 214, 0, 0.2)",
                          }}
                        >
                          {data.highScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Games
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {data.gamesPlayed}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Avg Score
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {computeAvgScore(data)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Room Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="glass-card p-6"
          >
            {roomLoading ? (
              <div className="space-y-3">
                <Skeleton className="w-40" />
                <Skeleton variant="card" />
              </div>
            ) : room ? (
              <>
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your Room
                </h3>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span
                    className="text-2xl font-mono font-black tracking-widest"
                    style={{
                      color: "var(--gold-accent)",
                      textShadow: "0 0 12px rgba(255, 214, 0, 0.3)",
                    }}
                  >
                    {room.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mb-4">
                  <p
                    className="text-xs uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Members ({room.members.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {room.members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "var(--gradient-primary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        {member.username}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  disabled={roomActionLoading}
                  className="btn-ghost w-full py-2 text-sm disabled:opacity-50"
                  style={{
                    color: "rgb(248, 113, 113)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {roomActionLoading ? "Leaving..." : "Leave Room"}
                </button>
              </>
            ) : (
              <>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Play with Friends
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Create a room and share the code with friends to compete!
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={roomActionLoading}
                  className="btn-primary w-full py-2.5 text-sm mb-4 disabled:opacity-50"
                >
                  {roomActionLoading ? "Creating..." : "Create Room"}
                </button>
                <div className="relative flex items-center gap-2">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <span
                    className="text-xs px-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    or join an existing room
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      if (roomError) setRoomError("");
                    }}
                    placeholder="Room code"
                    className="input-glass flex-1 text-center font-mono tracking-widest uppercase"
                    maxLength={8}
                    disabled={roomActionLoading}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={roomActionLoading || !joinCode.trim()}
                    className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </>
            )}
            {roomError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-3 text-center"
              >
                {roomError}
              </motion.p>
            )}
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pb-8"
          >
            <button
              onClick={handleLogout}
              className="btn-ghost w-full py-3 text-sm"
              style={{
                color: "rgb(248, 113, 113)",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
            >
              Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
