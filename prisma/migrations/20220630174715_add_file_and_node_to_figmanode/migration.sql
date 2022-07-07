/*
  Warnings:

  - Added the required column `file` to the `FigmaNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodeId` to the `FigmaNode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FigmaNode" (
    "userId" INTEGER NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "figmaNodeHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastRun" DATETIME NOT NULL,
    "nodeId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    CONSTRAINT "FigmaNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FigmaNode" ("figmaNodeHash", "id", "lastRun", "name", "userId") SELECT "figmaNodeHash", "id", "lastRun", "name", "userId" FROM "FigmaNode";
DROP TABLE "FigmaNode";
ALTER TABLE "new_FigmaNode" RENAME TO "FigmaNode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
