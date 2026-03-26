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
                path="/leaderboard"
                element={
                  <RequireAuth>
                    <div className="min-h-screen p-4 max-w-2xl mx-auto text-center pt-20 text-white/50">
                      Leaderboard coming soon
                    </div>
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
