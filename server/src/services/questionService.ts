import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getQuestions(
  count = 10,
  category?: string,
  difficulty?: string
) {
  const where: Record<string, unknown> = {};

  if (category) {
    where.category = category;
  }
  if (difficulty) {
    where.difficulty = difficulty;
  }

  let questions = await prisma.quizQuestion.findMany({ where });

  // Fallback: if no questions match filters, get all
  if (questions.length === 0 && (category || difficulty)) {
    questions = await prisma.quizQuestion.findMany();
  }

  // Shuffle and take requested count
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function getQuestionCount() {
  return prisma.quizQuestion.count();
}
