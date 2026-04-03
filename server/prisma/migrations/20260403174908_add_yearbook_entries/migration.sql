-- CreateTable
CREATE TABLE "YearbookEntry" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "favoriteGoalId" TEXT,
    "note" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YearbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YearbookEntry_playerId_idx" ON "YearbookEntry"("playerId");

-- CreateIndex
CREATE INDEX "YearbookEntry_favoriteGoalId_idx" ON "YearbookEntry"("favoriteGoalId");

-- AddForeignKey
ALTER TABLE "YearbookEntry" ADD CONSTRAINT "YearbookEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearbookEntry" ADD CONSTRAINT "YearbookEntry_favoriteGoalId_fkey" FOREIGN KEY ("favoriteGoalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
