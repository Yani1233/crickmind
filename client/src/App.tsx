import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { UserProvider, useUser } from "./context/UserContext";
import { Hub } from "./pages/Hub";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { WhoAmIGame } from "./modes/WhoAmI/WhoAmIGame";
import { StatAttackGame } from "./modes/StatAttack/StatAttackGame";
import { QuickFireGame } from "./modes/QuickFire/QuickFireGame";
import { HigherOrLowerGame } from "./modes/HigherOrLower/HigherOrLowerGame";
import { ConnectionsGame } from "./modes/Connections/ConnectionsGame";
import { TimelineGame } from "./modes/Timeline/TimelineGame";
import { MysteryXIGame } from "./modes/MysteryXI/MysteryXIGame";
import { AuctionArenaGame } from "./modes/AuctionArena/AuctionArenaGame";
import { Leaderboard } from "./pages/Leaderboard";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useUser();

  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Hub />
                  </RequireAuth>
                }
              />
              <Route
                path="/who-am-i"
                element={
                  <RequireAuth>
                    <WhoAmIGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/stat-attack"
                element={
                  <RequireAuth>
                    <StatAttackGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/quick-fire"
                element={
                  <RequireAuth>
                    <QuickFireGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/higher-or-lower"
                element={
                  <RequireAuth>
                    <HigherOrLowerGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/connections"
                element={
                  <RequireAuth>
                    <ConnectionsGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/timeline"
                element={
                  <RequireAuth>
                    <TimelineGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/mystery-xi"
                element={
                  <RequireAuth>
                    <MysteryXIGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/auction-arena"
                element={
                  <RequireAuth>
                    <AuctionArenaGame />
                  </RequireAuth>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <RequireAuth>
                    <Leaderboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </UserProvider>
    </QueryClientProvider>
  );
}
