import prisma from "./prismaClient.js";

async function confirmPassword(table, id, password) {
  const existPW =
    table == prisma.comment.getEntityName()
      ? await prisma.comment.findUniqueOrThrow({
          where: { id: parseInt(id) },
          include: {
            curation: {
              include: {
                style: true,
              },
            },
          },
        }).curation.style.password
      : await prisma[table].findUniqueOrThrow({
          where: { id: parseInt(id) },
        }).password;

  if (existPW !== password) {
    const e = new Error();
    e.name = "PasswordError";
    throw e;
  }
}

export default confirmPassword;
