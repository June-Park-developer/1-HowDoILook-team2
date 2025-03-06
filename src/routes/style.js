import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import fetch from "node-fetch"; // 큐레이팅 점수 가져오기
import prisma from "../utils/prismaClient.js";

const styleRouter = express.Router();

// 스타일 상세 조회 ranking 필요사항 추가
styleRouter
  .route("/styles/:id")

  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const style = await prisma.style.findUnique({
        where: { id: parseInt(id) },
        include: {
          categories: true,
          curation: true,
        },
      });

      if (!style) {
        return res
          .status(404)
          .json({ message: "해당 스타일을 찾을 수 없습니다." });
      }

      const curationCount = style.curation ? style.curation.length : 0;

      res.json({
        ...style,
        curationCount,
      });
    })
  )

  .put(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchStyle);
      const { id } = req.params;
      const { title, description, color } = req.body;

      const updatedStyle = await prisma.style.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          color,
        },
      });

      res.send(updatedStyle);
    })
  )

  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await prisma.style.delete({
        where: { id: parseInt(id) },
      });
      res.sendStatus(204);
    })
  );

styleRouter.get(
  "/ranking",
  asyncHandler(async (req, res) => {
    const { sort, page = 1, pageSize = 5 } = req.query;

    const response = await fetch(
      "http://localhost:3000/curations/average-scores"
    );
    const rankings = await response.json();

    rankings.forEach((style) => {
      style.curationCount = style.curation ? style.curation.length : 0;
      style.viewCount = style.viewCount || 0;
    });

    const orderByOptions = {
      total: (a, b) => b.total - a.total,
      trendy: (a, b) => b.avgScores.trendy - a.avgScores.trendy,
      personality: (a, b) => b.avgScores.personality - a.avgScores.personality,
      practicality: (a, b) =>
        b.avgScores.practicality - a.avgScores.practicality,
      costEffectiveness: (a, b) =>
        b.avgScores.costEffectiveness - a.avgScores.costEffectiveness,
    };

    // 첫 화면의 기본 정렬은 전체 ( total: 모든 옵션들의 평균 값 )
    const orderBy = orderByOptions[sort] || orderByOptions["total"];
    rankings.sort(orderBy);

    const totalItemCount = rankings.length;
    const totalPages = Math.ceil(totalItemCount / pageSize);
    const paginatedRankings = rankings.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    res.json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: paginatedRankings,
    });
  })
);

export default styleRouter;
