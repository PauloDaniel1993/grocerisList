-- CreateTable
CREATE TABLE "BoughtList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "groceryListId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoughtList_groceryListId_fkey" FOREIGN KEY ("groceryListId") REFERENCES "GroceryList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BoughtList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoughtItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL,
    "boughtListId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoughtItem_boughtListId_fkey" FOREIGN KEY ("boughtListId") REFERENCES "BoughtList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BoughtList_userId_idx" ON "BoughtList"("userId");

-- CreateIndex
CREATE INDEX "BoughtList_groceryListId_idx" ON "BoughtList"("groceryListId");

-- CreateIndex
CREATE INDEX "BoughtItem_boughtListId_idx" ON "BoughtItem"("boughtListId");
