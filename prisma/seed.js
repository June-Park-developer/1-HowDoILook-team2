import { PrismaClient } from "@prisma/client";
import { STYLES, CURATIONS, COMMENTS, CATEGORIES } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.style.deleteMany();
  await prisma.curation.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();

  await Promise.all(
    STYLES.map(async (style) => {
      await prisma.style.create({ data: style });
    })
  );

  await prisma.curation.createMany({
    data: CURATIONS,
    skipDuplicates: true,
  });

  await prisma.comment.createMany({
    data: COMMENTS,
    skipDuplicates: true,
  });

  await prisma.category.createMany({
    data: CATEGORIES,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
