-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "nhlId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "positionCode" TEXT NOT NULL,
    "sweaterNumber" INTEGER,
    "headshotUrl" TEXT,
    "birthDate" TEXT,
    "birthCity" TEXT,
    "birthCountry" TEXT,
    "heightInches" INTEGER,
    "weightPounds" INTEGER,
    "shootsCatches" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "nhlGameId" INTEGER NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "season" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "homeTeamAbbrev" TEXT NOT NULL,
    "awayTeamAbbrev" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "isHome" BOOLEAN NOT NULL,
    "opponentAbbrev" TEXT NOT NULL,
    "recapVideoId" TEXT,
    "condensedVideoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "nhlEventId" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "scorerId" TEXT,
    "scorerName" TEXT NOT NULL,
    "assist1Name" TEXT,
    "assist2Name" TEXT,
    "period" INTEGER NOT NULL,
    "periodTime" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "shotType" TEXT,
    "goalType" TEXT,
    "isEmptyNet" BOOLEAN NOT NULL DEFAULT false,
    "isGameWinning" BOOLEAN NOT NULL DEFAULT false,
    "isOvertimeGoal" BOOLEAN NOT NULL DEFAULT false,
    "scoringTeam" TEXT NOT NULL,
    "isSharksGoal" BOOLEAN NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "brightcoveId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonStats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "plusMinus" INTEGER NOT NULL DEFAULT 0,
    "pim" INTEGER NOT NULL DEFAULT 0,
    "ppGoals" INTEGER NOT NULL DEFAULT 0,
    "shGoals" INTEGER NOT NULL DEFAULT 0,
    "gwGoals" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shootingPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgToi" TEXT,
    "faceoffPct" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_nhlId_key" ON "Player"("nhlId");

-- CreateIndex
CREATE INDEX "Player_nhlId_idx" ON "Player"("nhlId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_nhlGameId_key" ON "Game"("nhlGameId");

-- CreateIndex
CREATE INDEX "Game_gameDate_idx" ON "Game"("gameDate");

-- CreateIndex
CREATE INDEX "Game_opponentAbbrev_idx" ON "Game"("opponentAbbrev");

-- CreateIndex
CREATE INDEX "Goal_scorerId_idx" ON "Goal"("scorerId");

-- CreateIndex
CREATE INDEX "Goal_gameId_idx" ON "Goal"("gameId");

-- CreateIndex
CREATE INDEX "Goal_goalType_idx" ON "Goal"("goalType");

-- CreateIndex
CREATE INDEX "Goal_isSharksGoal_idx" ON "Goal"("isSharksGoal");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonStats_playerId_key" ON "SeasonStats"("playerId");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonStats" ADD CONSTRAINT "SeasonStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
