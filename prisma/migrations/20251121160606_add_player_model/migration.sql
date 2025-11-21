-- AlterTable
ALTER TABLE "TradeItem" ADD COLUMN     "playerId" TEXT,
ALTER COLUMN "draftPickId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "nhlPlayerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team" TEXT,
    "position" TEXT NOT NULL,
    "headshotUrl" TEXT,
    "teamLogoUrl" TEXT,
    "jerseyNumber" INTEGER,
    "age" INTEGER,
    "dateOfBirth" TEXT,
    "birthCity" TEXT,
    "birthCountry" TEXT,
    "nationality" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "draftYear" INTEGER,
    "draftTeam" TEXT,
    "draftRound" INTEGER,
    "draftPosition" INTEGER,
    "isTraded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_nhlPlayerId_key" ON "Player"("nhlPlayerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeItem" ADD CONSTRAINT "TradeItem_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
