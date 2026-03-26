import { Header } from "../../components/Header";

export function WhoAmIGame() {
  return (
    <div className="min-h-screen">
      <Header title="Who Am I?" />
      <div className="flex items-center justify-center h-[80vh] text-white/50">
        Loading game mode...
      </div>
    </div>
  );
}
