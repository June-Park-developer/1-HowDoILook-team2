import { Prisma, PrismaClient, CategoryType } from "@prisma/client";
const prisma = new PrismaClient().$extends({
  model: {
    $allModels: {
      getEntityName() {
        const context = Prisma.getExtensionContext(this);
        return context.$name;
      },
    },
  },
  CategoryType: CategoryType,
});
export default prisma;
