import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { QuizQuestion } from "../../../shared/src/types";

export function useQuizQuestions(
  count = 10,
  category?: string,
  difficulty?: string
) {
  const params = new URLSearchParams({ count: String(count) });
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);

  return useQuery({
    queryKey: ["quizQuestions", count, category, difficulty],
    queryFn: () => apiFetch<QuizQuestion[]>(`/questions?${params}`),
    enabled: false, // manual refetch
  });
}

export function useQuestionCount() {
  return useQuery({
    queryKey: ["questionCount"],
    queryFn: () => apiFetch<{ count: number }>("/questions/count"),
  });
}
