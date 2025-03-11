import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../utils/prismaClient.js";
import { assert } from "superstruct";
import { TagQuery } from "../utils/structs.js";

const tagRouter = express.Router();

tagRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const popularTags = await prisma.tag.findMany({
      include: { _count: { select: { styles: true } } },
      orderBy: { styles: { _count: "desc" } },
      take: 10,
    });

    res.json(
      popularTags.map((tag) => ({
        tagname: tag.tagname,
        count: tag._count.styles,
      }))
    );
  })
);

tagRouter.get(
  "/:tagname",
  asyncHandler(async (req, res) => {
    assert(req.params, TagQuery);
    const { tagname } = req.params;

    const styles = await prisma.style.findMany({
      where: {
        tags: { some: { tagname } },
      },
      include: {
        categories: true,
        tags: { select: { tagname: true } },
        curations: true,
      },
    });

    res.json(styles);
  })
);

tagRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    assert(req.body, TagQuery);

    const { tagname } = req.body;

    const existingTag = await prisma.tag.findUnique({
      where: { tagname },
    });

    if (existingTag) {
      return res.status(409).json({ message: "이미 존재하는 태그입니다." });
    }
    const newTag = await prisma.tag.create({
      data: { tagname },
    });

    res.status(201).json(newTag);
  })
);

tagRouter.delete(
  "/:tagname",
  asyncHandler(async (req, res) => {
    assert(req.params, TagQuery);

    const { tagname } = req.params;

    const tagInUse = await prisma.tag.findUnique({
      where: { tagname },
      include: { styles: true },
    });

    if (!tagInUse) {
      return res.status(404).json({ message: "존재하지 않는 태그입니다." });
    }

    if (tagInUse.styles.length > 0) {
      return res
        .status(400)
        .json({ message: "현재 사용 중인 태그는 삭제할 수 없습니다." });
    }

    await prisma.tag.delete({
      where: { tagname },
    });

    res.status(204).send();
  })
);

export default tagRouter;
