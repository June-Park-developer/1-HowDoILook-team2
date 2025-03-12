import prisma from "./prismaClient.js";

async function confirmPassword(table, id, password) {
  let existPW;
  if (
    table == prisma.style.getEntityName() ||
    table == prisma.curation.getEntityName()
  ) {
    const record = await prisma[table].findUniqueOrThrow({
      where: { id: parseInt(id) },
    });
    existPW = record.password;
  } else if ((table = prisma.comment.getEntityName())) {
    const comment = await prisma.comment.findUniqueOrThrow({
      where: { id: parseInt(id) },
      include: {
        curation: {
          include: {
            style: true,
          },
        },
      },
    });
    existPW = comment.curation.style.password;
  } else {
    const e = new Error();
    e.name = "Entity doesn't have the password.";
    throw e;
  }
  if (existPW !== password) {
    const e = new Error();
    e.name = "PasswordError";
    throw e;
  }
}

export default confirmPassword;
