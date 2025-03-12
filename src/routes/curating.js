import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { assert } from "superstruct";
import { Password, PatchCuration, OrOverZeroString } from "../utils/structs.js";
import { CreateComment } from "../utils/structs.js";
import prisma from "../utils/prismaClient.js";
import confirmPassword from "../utils/confirmPassword.js";

const curationRouter = express.Router();

curationRouter
  .route("/:curationId")
  .put(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchCuration);
      const { curationId } = req.params;
      assert(curationId, OrOverZeroString);
      const { password } = req.body;
      const modelName = prisma.curation.getEntityName();
      await confirmPassword(modelName, curationId, password);
      const curation = await prisma.curation.update({
        where: { id: parseInt(curationId) },
        data: req.body,
        select: {
          id: true,
          nickname: true,
          content: true,
          trendy: true,
          personality: true,
          practicality: true,
          costEffectiveness: true,
          createdAt: true,
        },
      });
      res.json(curation);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      assert(req.body, Password);
      const { curationId } = req.params;
      assert(curationId, OrOverZeroString);
      const { password } = req.body;
      const modelName = prisma.curation.getEntityName();
      await confirmPassword(modelName, curationId, password);
      await prisma.curation.delete({
        where: { id: parseInt(curationId) },
      });
      res.json({ message: "큐레이팅 삭제 성공" });
    })
  );

curationRouter.route("/:curationId/comments").post(
  asyncHandler(async (req, res) => {
    const { curationId } = req.params;
    assert(curationId, OrOverZeroString);
    assert(req.body, CreateComment);

    const modelName = prisma.curation.getEntityName();
    await confirmPassword(modelName, curationId, req.body.password);

    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        password: req.body.password,
        curationId: parseInt(curationId),
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
    res.status(201).json(resultJson);
  })
);

curationRouter.get(
  "/average-scores",
  asyncHandler(async (req, res) => {
    const styles = await prisma.style.findMany({
      include: {
        curations: {
          select: {
            trendy: true,
            personality: true,
            practicality: true,
            costEffectiveness: true,
          },
        },
      },
    });

    // 코드 추가(재웅) : 스타일별 평균 점수 계산 API
    const averageScores = styles.map((style) => {
      const totalCuration = style.curations.length;

      const avgScores = totalCuration
        ? {
            trendy:
              style.curations.reduce((sum, c) => sum + c.trendy, 0) /
              totalCuration,
            personality:
              style.curations.reduce((sum, c) => sum + c.personality, 0) /
              totalCuration,
            practicality:
              style.curations.reduce((sum, c) => sum + c.practicality, 0) /
              totalCuration,
            costEffectiveness:
              style.curations.reduce((sum, c) => sum + c.costEffectiveness, 0) /
              totalCuration,
          }
        : { trendy: 0, personality: 0, practicality: 0, costEffectiveness: 0 };

      return {
        styleId: style.id,
        avgScores,
        // 전체 평균 점수 (total) 계산
        total:
          (avgScores.trendy +
            avgScores.personality +
            avgScores.practicality +
            avgScores.costEffectiveness) /
          4,
      };
    });

    res.json(averageScores);
  })
);

export default curationRouter;
