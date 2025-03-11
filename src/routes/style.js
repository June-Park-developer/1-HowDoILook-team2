import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prismaClient.js";
import { assert } from "superstruct";
import { CreateStyle, PatchStyle, Password } from "../utils/structs.js";
import confirmPassword from "../utils/confirmPassword.js";

const styleRouter = express.Router();

// 스타일 목록 조회, 등록
styleRouter
  .route("/styles")
  .get(
    asyncHandler(async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || "latest";
        const searchBy = req.query.searchBy || "title";
        const keyword = req.query.keyword || "";
        const tag = req.query.tag || "";

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

        // searchBy
        let where = {};
        if (keyword) {
          where[searchBy] = { contains: keyword, mode: "insensitive" };
        }

        // tag
        if (tag) {
          where.tags = { has: tag };
        }

        const styles = await prisma.style.findMany({
          where,
          orderBy,
          skip,
          take,
        });
        res.json({
          currentPage: page,
          totalPages,
          totalItemCount,
          data: styles,
        });
      } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다" });
      }
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      const { styleId, title } = req.params;
      assert(req.body, CreateStyle);

      const existingStyle = await prisma.style.findUnique({
        where: { title },
      });

      if (existingStyle) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }

      const newStyle = await prisma.style.create({
        data: {
          content: req.body.content,
          password: req.body.password,
          styleId: parseInt(styleId),
        },
        select: {
          id: true,
          password: true,
          content: true,
          createdAt: true,
        },
      });
      res.status(201).json(newStyle);
    })
  );

// 스타일 상세 조회, 수정, 삭제
styleRouter
  .route("/styles/:id")
  .get(
    asyncHandler(async (req, res) => {
      const { styleId } = req.params;
      const style = await prisma.style.findUnique({
        where: { id: parseInt(styleId) },
      });
      if (!style) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }
      res.json(style);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchStyle);
      const { styleId } = req.params;
      const { password } = req.body;
      const modelName = prisma.style.getEntityName();
      await confirmPassword(modelName, styleId, password);
      const style = await prisma.style.update({
        where: { id: parseInt(styleId) },
        data: req.body,
      });
      res.json(style);
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      assert(req.body, Password);
      const { styleId } = req.params;
      const { password } = req.body;
      const modelName = prisma.style.getEntityName();
      await confirmPassword(modelName, styleId, password);
      await prisma.style.delete({
        where: { id: parseInt(styleId) },
      });
      res.json({ message: "스타일 삭제 성공" });
    })
  );

export default styleRouter;
