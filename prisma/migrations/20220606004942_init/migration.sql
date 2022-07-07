-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "figmaKey" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FigmaNode" (
    "userId" INTEGER NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "figmaNodeHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastRun" DATETIME NOT NULL,
    CONSTRAINT "FigmaNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
