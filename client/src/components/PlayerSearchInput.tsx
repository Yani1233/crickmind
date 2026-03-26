import { useState, useRef, useEffect } from "react";
import { usePlayerSearch } from "../api/players";

const FLAG_MAP: Record<string, string> = {
  IND: "🇮🇳", AUS: "🇦🇺", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", PAK: "🇵🇰", SA: "🇿🇦",
  NZ: "🇳🇿", SL: "🇱🇰", WI: "🏏", BAN: "🇧🇩", AFG: "🇦🇫",
  ZIM: "🇿🇼", IRE: "🇮🇪", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", NEP: "🇳🇵",
};

interface PlayerSearchInputProps {
  onSelect: (player: { id: string; name: string; country: string }) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PlayerSearchInput({
  onSelect,
  disabled = false,
  placeholder = "Type a cricketer's name...",
}: PlayerSearchInputProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: results, isLoading } = usePlayerSearch(debouncedQuery);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) setIsOpen(true);
  }, [debouncedQuery]);

  function handleSelect(player: { id: string; name: string; country: string }) {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    onSelect(player);
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => debouncedQuery.length >= 2 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#16213E] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FFD600] transition-colors disabled:opacity-50"
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#16213E] border border-white/20 rounded-xl overflow-hidden shadow-xl z-50 max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-white/50 text-sm">Searching...</div>
          )}
          {!isLoading && results && results.length === 0 && (
            <div className="px-4 py-3 text-white/50 text-sm">No players found</div>
          )}
          {results?.map((player) => (
            <button
              key={player.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(player)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
            >
              <span>{FLAG_MAP[player.country] ?? "🏏"}</span>
              <span>{player.name}</span>
              <span className="text-white/40 text-xs ml-auto">{player.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
