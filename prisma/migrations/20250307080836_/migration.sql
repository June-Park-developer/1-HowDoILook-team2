/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Curation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Curation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Style` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tags` on the `Style` table. All the data in the column will be lost.
  - The `id` column on the `Style` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `styleId` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `curationId` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `styleId` on the `Curation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_curationId_fkey";

-- DropForeignKey
ALTER TABLE "Curation" DROP CONSTRAINT "Curation_styleId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "styleId",
ADD COLUMN     "styleId" INTEGER NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "curationId",
ADD COLUMN     "curationId" INTEGER NOT NULL,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Curation" DROP CONSTRAINT "Curation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "styleId",
ADD COLUMN     "styleId" INTEGER NOT NULL,
ADD CONSTRAINT "Curation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Style" DROP CONSTRAINT "Style_pkey",
DROP COLUMN "tags",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Style_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Tag" (
    "tagname" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tagname")
);

-- CreateTable
CREATE TABLE "_StyleToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StyleToTag_AB_unique" ON "_StyleToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StyleToTag_B_index" ON "_StyleToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_curationId_key" ON "Comment"("curationId");

-- AddForeignKey
ALTER TABLE "Curation" ADD CONSTRAINT "Curation_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_curationId_fkey" FOREIGN KEY ("curationId") REFERENCES "Curation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StyleToTag" ADD CONSTRAINT "_StyleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StyleToTag" ADD CONSTRAINT "_StyleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("tagname") ON DELETE CASCADE ON UPDATE CASCADE;
