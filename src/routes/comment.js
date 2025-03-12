import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { assert } from "superstruct";
import { CreateComment, Password } from "../utils/structs.js";
import prisma from "../utils/prismaClient.js";
import confirmPassword from "../utils/confirmPassword.js";

const commentRouter = express.Router();

commentRouter
  .route("/:commentId")
  .put(
    asyncHandler(async (req, res) => {
      const { commentId } = req.params;
      assert(req.body, CreateComment);
      const { content, password } = req.body;

      const modelName = prisma.comment.getEntityName();
      await confirmPassword(modelName, commentId, password);

      const comment = await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: {
          content: content,
        },
        select: {
          id: true,
          password: true,
          content: true,
          createdAt: true,
        },
      });
      res.json(comment);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { commentId } = req.params;
      assert(req.body, Password);
      const { password } = req.body;
      const modelName = prisma.comment.getEntityName();
      await confirmPassword(modelName, commentId, password);
      await prisma.comment.delete({
        where: { id: parseInt(commentId) },
      });
      res.json({ message: "답글 삭제 성공" });
    })
  );

export default commentRouter;
