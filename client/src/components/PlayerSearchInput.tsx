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
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)", fontSize: "1rem" }}
        >
          🔎
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => debouncedQuery.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          disabled={disabled}
          placeholder={placeholder}
          className="input-glass pl-10"
          style={{ width: "100%" }}
        />
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 glass-card overflow-hidden z-50 max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
              Searching...
            </div>
          )}
          {!isLoading && results && results.length === 0 && (
            <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
              No players found
            </div>
          )}
          {results?.map((player) => (
            <button
              key={player.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(player)}
              className="w-full px-4 py-3 text-left flex items-center gap-2 transition-colors"
              style={{
                color: "var(--text-primary)",
                background: "transparent",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{FLAG_MAP[player.country] ?? "🏏"}</span>
              <span>{player.name}</span>
              <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                {player.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
