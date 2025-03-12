import express from "express";
import { assert } from "superstruct";
import fetch from "node-fetch";

import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prismaClient.js";
import confirmPassword from "../utils/confirmPassword.js";
import {
  CreateCuration,
  ValidQuery,
  OrOverZeroString,
  OptionalQuery,
  CreateStyle,
  PatchStyle,
  Password,
} from "../utils/structs.js";

const styleRouter = express.Router();
styleRouter
  .route("/:styleId/curations")
  .get(
    asyncHandler(async (req, res) => {
      const { styleId } = req.params;
      assert(styleId, OrOverZeroString);
      assert(req.query, ValidQuery);
      const {
        page = "1",
        pageSize = "5",
        searchBy = "content",
        keyword = "",
      } = req.query;
      const offset = parseInt(pageSize) * (parseInt(page) - 1);
      let search;
      switch (searchBy) {
        case "nickname":
          search = { nickname: { contains: keyword } };
          break;
        case "content":
          search = { content: { contains: keyword } };
          break;
        default:
          const e = new Error();
          e.name = "BadQuery";
          throw e;
      }
      const curations = await prisma.curation.findMany({
        skip: offset,
        take: parseInt(pageSize),
        where: { ...search, styleId: parseInt(styleId) },
      });
      const totalItemCount = await prisma.curation.count({
        where: { ...search, styleId: parseInt(styleId) },
      });
      const totalPages = Math.ceil(totalItemCount / pageSize);
      const currentPage = parseInt(page);
      res.json({ currentPage, totalPages, totalItemCount, data: curations });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateCuration);
      const { styleId } = req.params;
      const curation = await prisma.curation.create({
        data: {
          ...req.body,
          style: {
            connect: { id: parseInt(styleId) },
          },
        },
      });
      res.status(201).json(curation);
    })
  );

//랭킹
styleRouter.get(
  "/ranking",
  asyncHandler(async (req, res) => {
    assert(req.query, OptionalQuery);

    const { sort, page = 1, pageSize = 5 } = req.query;

    const response = await fetch(
      "http://localhost:3000/curations/average-scores"
    );
    const rankings = await response.json();
    const styles = await prisma.style.findMany({
      include: {
        tags: { select: { tagname: true } },
      },
    });

    rankings.forEach((ranking) => {
      const style = styles.find((s) => s.id === ranking.styleId);
      if (style) {
        ranking.tags = style.tags.map((tag) => tag.tagname);
        style.curationCount = style.curations ? style.curations.length : 0;
        style.viewCount = style.viewCount || 0;
      }
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
//스타일 상세 조회 ranking 필요사항 추가
styleRouter
  .route("/:styleId")
  .get(
    asyncHandler(async (req, res) => {
      assert(req.params.styleId, OrOverZeroString);

      const { styleId } = req.params;
      assert(styleId, OrOverZeroString);
      const style = await prisma.style.findUnique({
        where: { id: parseInt(styleId) },
        include: {
          categories: true,
          curations: true,
          tags: { select: { tagname: true } },
        },
      });
      //수정
      res.json({
        ...style,
        tags: style.tags?.map((tag) => tag.tagname) ?? [],
        categories: style.categories ?? [],
        imageUrls: style.imageUrls ?? [],
        curationCount: style.curations ? style.curations.length : 0,
      });
    })
  )

  .put(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchStyle);
      const { styleId } = req.params;
      assert(styleId, OrOverZeroString);
      const { password } = req.body;
      const modelName = prisma.style.getEntityName();
      await confirmPassword(modelName, styleId, password);

      const tagRecords = await Promise.all(
        tags.map(async (tagname) => {
          return await prisma.tag.upsert({
            where: { tagname },
            update: {},
            create: { tagname },
          });
        })
      );

      const updatedStyle = await prisma.style.update({
        where: { id: parseInt(styleId) },
        data: {
          ...req.body,
          tags: {
            set: [],
            connect: tagRecords.map((tag) => ({ tagname: tag.tagname })),
          },
        },
        include: {
          tags: { select: { tagname: true } },
        },
      });

      res.send(updatedStyle);
    })
  )

  .delete(
    asyncHandler(async (req, res) => {
      assert(req.body, Password);
      const { styleId } = req.params;
      assert(styleId, OrOverZeroString);
      const { password } = req.body;
      const modelName = prisma.style.getEntityName();
      await confirmPassword(modelName, styleId, password);
      await prisma.style.delete({
        where: { id: parseInt(styleId) },
      });
      res.json({ message: "스타일 삭제 성공" });
    })
  );

// 스타일 목록 조회, 등록
styleRouter
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const sortBy = req.query.sortBy || "latest";
      const searchBy = req.query.searchBy || "title";
      const keyword = req.query.keyword || "";
      const tag = req.query.tag || "";
      assert(req.query, ValidQuery);

      // pageSize
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      // sortBy
      let orderBy = {};
      if (sortBy === "latest") {
        orderBy = { createdAt: "desc" };
      } else if (sortBy === "mostViewed") {
        orderBy = { viewCount: "desc" };
      } else if (sortBy === "mostCurated") {
        orderBy = { curationCount: "desc" };
      }

      let search;
      switch (searchBy) {
        case "nickname":
          search = { nickname: { contains: keyword, mode: "insensitive" } };
          break;
        case "content":
          search = { content: { contains: keyword, mode: "insensitive" } };
          break;
        case "title":
          search = { title: { contains: keyword, mode: "insensitive" } };
          break;
        case "tag":
          search = { tags: { some: { tagname: tag } } };
          break;
        default:
          const e = new Error();
          e.name = "BadQuery";
          throw e;
      }

      const styles = await prisma.style.findMany({
        where: { ...search },
        orderBy,
        skip,
        take,
      });
      const totalItemCount = await prisma.style.count();
      const totalPages = Math.ceil(totalItemCount / pageSize);
      res.json({
        currentPage: page,
        totalPages,
        totalItemCount,
        data: styles,
      });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateStyle);

      const newStyle = await prisma.style.create({
        data: { ...req.body },
        select: {
          id: true,
          password: true,
          content: true,
          createdAt: true,
          //추가
          viewcount: 0,
        },
      });
      res.status(201).json(newStyle);
    })
  );

export default styleRouter;
