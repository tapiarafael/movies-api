/*
  Warnings:

  - You are about to drop the column `producerId` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `studioId` on the `Movie` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_MovieToProducer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MovieToProducer_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MovieToProducer_B_fkey" FOREIGN KEY ("B") REFERENCES "Producer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MovieToStudio" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MovieToStudio_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MovieToStudio_B_fkey" FOREIGN KEY ("B") REFERENCES "Studio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "winner" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Movie" ("createdAt", "id", "releaseYear", "title", "updatedAt", "winner") SELECT "createdAt", "id", "releaseYear", "title", "updatedAt", "winner" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToProducer_AB_unique" ON "_MovieToProducer"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToProducer_B_index" ON "_MovieToProducer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToStudio_AB_unique" ON "_MovieToStudio"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToStudio_B_index" ON "_MovieToStudio"("B");
