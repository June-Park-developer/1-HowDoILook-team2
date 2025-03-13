import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { assert } from "superstruct";
import { CreateComment, Password, OrOverZeroString } from "../utils/structs.js";
import prisma from "../utils/prismaClient.js";
import confirmPassword from "../utils/confirmPassword.js";

const commentRouter = express.Router();

commentRouter
  .route("/:commentId")
  .put(
    asyncHandler(async (req, res) => {
      const { commentId } = req.params;
      assert(commentId, OrOverZeroString);
      assert(req.body, CreateComment);
      const { content } = req.body;
      const modelName = await prisma.comment.getEntityName();
      await confirmPassword(modelName, commentId, req.body.password);

      const comment = await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: {
          content: content,
        },
        select: {
          id: true,
          curation: {
            select: {
              style: {
                select: {
                  nickname: true,
                },
              },
            },
          },
          content: true,
          createdAt: true,
        },
      });
      const resultJson = {
        id: comment.id,
        nickname: comment.curation.style.nickname,
        content: comment.content,
        createdAt: comment.createdAt,
      };
      res.json(resultJson);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { commentId } = req.params;
      assert(commentId, OrOverZeroString);
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
