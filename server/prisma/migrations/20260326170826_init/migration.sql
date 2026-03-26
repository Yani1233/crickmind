-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "formats" TEXT[],
    "batting_hand" TEXT NOT NULL,
    "bowling_style" TEXT NOT NULL,
    "popularity_tier" INTEGER NOT NULL DEFAULT 3,
    "born_year" INTEGER NOT NULL,
    "debut_year" INTEGER NOT NULL,
    "retired" BOOLEAN NOT NULL DEFAULT false,
    "total_matches" INTEGER NOT NULL,
    "total_runs" INTEGER NOT NULL,
    "batting_avg" DOUBLE PRECISION NOT NULL,
    "strike_rate" DOUBLE PRECISION NOT NULL,
    "total_wickets" INTEGER NOT NULL,
    "bowling_avg" DOUBLE PRECISION NOT NULL,
    "economy_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ipl_team" TEXT NOT NULL DEFAULT 'None',
    "photo_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_answer" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "format_tag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "anonymous_id" TEXT,
    "mode" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players_raw" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "role" TEXT,
    "formats" TEXT[],
    "batting_hand" TEXT,
    "bowling_style" TEXT,
    "born_year" INTEGER,
    "debut_year" INTEGER,
    "retired" BOOLEAN,
    "total_matches" INTEGER,
    "total_runs" INTEGER,
    "batting_avg" DOUBLE PRECISION,
    "strike_rate" DOUBLE PRECISION,
    "total_wickets" INTEGER,
    "bowling_avg" DOUBLE PRECISION,
    "economy_rate" DOUBLE PRECISION,
    "ipl_team" TEXT,
    "source" TEXT NOT NULL,
    "raw_data" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_raw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_name_key" ON "players"("name");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_question_key" ON "quiz_questions"("question");
