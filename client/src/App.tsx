import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Hub } from "./pages/Hub";
import { WhoAmIGame } from "./modes/WhoAmI/WhoAmIGame";
import { StatAttackGame } from "./modes/StatAttack/StatAttackGame";
import { QuickFireGame } from "./modes/QuickFire/QuickFireGame";
import { HigherOrLowerGame } from "./modes/HigherOrLower/HigherOrLowerGame";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/who-am-i" element={<WhoAmIGame />} />
          <Route path="/stat-attack" element={<StatAttackGame />} />
          <Route path="/quick-fire" element={<QuickFireGame />} />
          <Route path="/higher-or-lower" element={<HigherOrLowerGame />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
