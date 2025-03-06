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
      const { title, description, color } = req.body;

      const existingStyle = await prisma.style.findUnique({
        where: { title },
      });

      if (existingStyle) {
        return res.status(409).json({ error: "Style name already exists" });
      }

      const newStyle = await prisma.style.create({
        data: {
          title,
          description: description || "",
          color,
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
      const style = await prisma.style.findUnique({
        where: { id: parseInt(id) },
      });
      if (!style) {
        return res.status(404).json({ error: "Style not found" });
      }
      res.send(style);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      assert(req.body, PatchStyle);
      const { id } = req.params;
      const { name, description, color } = req.body;

      const updatedStyle = await prisma.style.update({
        where: { id: parseInt(id) },
        data: {
          name,
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

export default styleRouter;
