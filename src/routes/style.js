import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { PrismaClient } from "@prisma/client";
import { assert } from "superstruct";
import { CreateStyle, PatchStyle } from "../utils/structs.js";
import confirmPassword from "../utils/confirmPassword.js";

const prisma = new PrismaClient();
const styleRouter = express.Router();

// 스타일 목록 조회, 등록
styleRouter
  .route("/styles")
  .get(
    asyncHandler(async (req, res) => {
      const { offset = 0, limit = 10 } = req.query;
      const styles = await prisma.style.findMany({
        skip: parseInt(offset),
        take: parseInt(limit),
      });
      res.send(styles);
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateStyle);
      const { nickname, title, content } = req.body;

      const existingStyle = await prisma.style.findUnique({
        where: { title },
      });

      if (existingStyle) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }

      const newStyle = await prisma.style.create({
        data: {
          nickname,
          title,
          content,
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
      const { id } = req.params;
      const style = await prisma.style.findUniqueOrThrow({
        where: { id: parseInt(id) },
      });
      if (!style) {
        return res.status(400).json({ error: "잘못된 요청입니다." });
      }
      res.send(style);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchStyle);
      const { id } = req.params;
      const { nickname, title, content } = req.body;

      const updatedStyle = await prisma.style.update({
        where: { id: parseInt(id) },
        data: {
          nickname,
          title,
          content,
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

export default styleRouter;
