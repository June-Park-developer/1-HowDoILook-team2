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
  CreateCategories,
} from "../utils/structs.js";
import { CategoryType } from "@prisma/client";

function isolateCategoriesTagsArray(body) {
  const categoriesReqJson = body.categories;
  delete body.categories;
  const tagsReqArray = body.tags;
  if (tagsReqArray) delete body.tags;

  let categoriesInputArray = [];
  Object.keys(categoriesReqJson).forEach((key) => {
    let categoryType;
    switch (key) {
      case "top":
        categoryType = CategoryType.TOP;
        break;
      case "bottom":
        categoryType = CategoryType.BOTTOM;
        break;
      case "outer":
        categoryType = CategoryType.OUTER;
        break;
      case "dress":
        categoryType = CategoryType.DRESS;
        break;
      case "shoes":
        categoryType = CategoryType.SHOES;
        break;
      case "bag":
        categoryType = CategoryType.BAG;
        break;
      case "accessory":
        categoryType = CategoryType.ACCESSORY;
        break;
      default:
        const e = new Error();
        e.name = "BadQuery";
        throw e;
    }
    categoriesInputArray.push({
      name: categoriesReqJson[key].name,
      brand: categoriesReqJson[key].brand,
      price: categoriesReqJson[key].price,
      type: categoryType,
    });
  });

  let tagsInputArray = [];
  Object.values(tagsReqArray).forEach((item) =>
    tagsInputArray.push({
      where: { tagname: item },
      create: { tagname: item },
    })
  );

  return { categoriesInputArray, tagsInputArray, tagsReqArray };
}

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
          search = { nickname: { contains: keyword, mode: "insensitive" } };
          break;
        case "content":
          search = { content: { contains: keyword, mode: "insensitive" } };
          break;
        default:
          const e = new Error();
          e.name = "BadQuery";
          throw e;
      }
      const style = await prisma.style.findUniqueOrThrow({
        where: { id: parseInt(styleId) },
      });
      const curations = await prisma.curation.findMany({
        skip: offset,
        take: parseInt(pageSize),
        where: { ...search, styleId: parseInt(styleId) },
        select: {
          id: true,
          nickname: true,
          content: true,
          trendy: true,
          personality: true,
          practicality: true,
          costEffectiveness: true,
          createdAt: true,
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
        },
      });

      const filteredCurations = curations.filter(
        (curation) => curation !== undefined
      );

      filteredCurations.forEach((curation) => {
        if (curation.comment == null) {
          curation.comment = {};
        }
      });

      const totalItemCount = await prisma.curation.count({
        where: { ...search, styleId: parseInt(styleId) },
      });
      const totalPages = Math.ceil(totalItemCount / pageSize);

      const currentPage = parseInt(page);
      if (totalPages !== 0 && currentPage > totalPages) {
        const e = new Error();
        e.name = "BadQuery";
        throw e;
      }
      res.json({
        currentPage,
        totalPages,
        totalItemCount,
        data: filteredCurations,
      });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateCuration);
      const { styleId } = req.params;
      assert(styleId, OrOverZeroString);
      const curation = await prisma.curation.create({
        data: {
          ...req.body,
          styleId: parseInt(styleId),
        },
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
      res.status(201).json(curation);
    })
  );

styleRouter.get(
  "/ranking",
  asyncHandler(async (req, res) => {
    assert(req.query, OptionalQuery);

    const { rankBy = "total", page = 1, pageSize = 5 } = req.query;
    const pageInt = parseInt(page);
    const pageSizeInt = parseInt(pageSize);

    const response = await fetch(
      `${process.env.RENDER_EXTERNAL_URL}/curations/average-scores`
    );
    const rawRankings = await response.json();

    const styles = await prisma.style.findMany({
      include: {
        tags: { select: { tagname: true } },
        categories: {
          select: { name: true, brand: true, price: true, type: true },
        },
        curations: { select: { id: true } },
      },
    });

    const rankings = rawRankings
      .map((ranking) => {
        const style = styles.find((s) => s.id === ranking.id);

        if (!style) return null;

        const thumbnailImage =
          style.imageUrls.length > 0 ? style.imageUrls[0] : "";

        const categoriesObject = {};

        if (style.categories && style.categories.length > 0) {
          style.categories.forEach((category) => {
            let categoryKey = "";

            switch (category.type) {
              case "TOP":
                categoryKey = "top";
                break;
              case "BOTTOM":
                categoryKey = "bottom";
                break;
              case "OUTER":
                categoryKey = "outer";
                break;
              case "DRESS":
                categoryKey = "dress";
                break;
              case "SHOES":
                categoryKey = "shoes";
                break;
              case "BAG":
                categoryKey = "bag";
                break;
              case "ACCESSORY":
                categoryKey = "accessory";
                break;
              default:
                categoryKey = category.type.toLowerCase();
            }

            categoriesObject[categoryKey] = {
              name: category.name,
              brand: category.brand,
              price: category.price,
            };
          });
        }

        return {
          id: ranking.id,
          avgScores: ranking.avgScores,
          total: ranking.total,
          thumbnail: thumbnailImage,
          nickname: style.nickname || "",
          title: style.title || "",
          tags: style.tags.map((tag) => tag.tagname),
          categories: categoriesObject,
          viewCount: style.viewCount || 0,
          curationCount: style.curations.length,
          createdAt: style.createdAt,
        };
      })
      .filter(Boolean);

    const orderByOptions = {
      total: (a, b) => b.total - a.total,
      trendy: (a, b) => b.avgScores.trendy - a.avgScores.trendy,
      personality: (a, b) => b.avgScores.personality - a.avgScores.personality,
      practicality: (a, b) =>
        b.avgScores.practicality - a.avgScores.practicality,
      costEffectiveness: (a, b) =>
        b.avgScores.costEffectiveness - a.avgScores.costEffectiveness,
    };

    const orderBy = orderByOptions[rankBy] || orderByOptions["total"];
    rankings.sort(orderBy);

    rankings.forEach((item, index) => {
      item.ranking = index + 1;
      if (rankBy === "total") {
        item.rating = item.total;
      } else {
        item.rating = item.avgScores[rankBy];
      }
    });

    const totalItemCount = rankings.length;
    const totalPages = Math.ceil(totalItemCount / pageSizeInt);
    const paginatedRankings = rankings
      .slice((pageInt - 1) * pageSizeInt, pageInt * pageSizeInt)
      .map((item) => {
        const { total, avgScores, ...rest } = item;
        return rest;
      });

    res.json({
      currentPage: pageInt,
      totalPages,
      totalItemCount,
      data: paginatedRankings,
    });
  })
);

styleRouter
  .route("/:styleId")
  .get(
    asyncHandler(async (req, res) => {
      assert(req.params.styleId, OrOverZeroString);

      const { styleId } = req.params;
      assert(styleId, OrOverZeroString);

      await prisma.style.update({
        where: { id: parseInt(styleId) },
        data: { viewCount: { increment: 1 } },
      });

      const style = await prisma.style.findUniqueOrThrow({
        where: { id: parseInt(styleId) },
        select: {
          id: true,
          nickname: true,
          title: true,
          content: true,
          viewCount: true,
          createdAt: true,
          categories: true,
          tags: { select: { tagname: true } },
          imageUrls: true,
          curations: {
            select: {
              id: true,
              nickname: true,
              content: true,
            },
          },
        },
      });
      const transformedCategories = (style.categories || []).reduce(
        (object, { type, name, brand, price }) => {
          object[type.toLowerCase()] = { name, brand, price };
          return object;
        },
        {}
      );
      style.categories = transformedCategories;

      style.curations = Array.isArray(style.curations) ? style.curations : [];
      const curationCount = style.curations.length;

      res.json({
        ...style,
        tags: style.tags?.map((tag) => tag.tagname) ?? [],
        categories: style.categories ?? [],
        imageUrls: style.imageUrls ?? [],
        curationCount,
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
        req.body.tags.map(async (tagname) => {
          return await prisma.tag.upsert({
            where: { tagname },
            update: {},
            create: { tagname },
          });
        })
      );

      const isolatedArray = isolateCategoriesTagsArray(req.body);

      const updatedStyle = await prisma.style.update({
        where: { id: parseInt(styleId) },
        data: {
          ...req.body,
          tags: {
            set: [],
            connectOrCreate: tagRecords.map((tag) => ({
              where: { tagname: tag.tagname },
              create: { tagname: tag.tagname },
            })),
          },
          categories: {
            deleteMany: {},
            create: isolatedArray.categoriesInputArray,
          },
        },
        select: {
          id: true,
          nickname: true,
          title: true,
          content: true,
          viewCount: true,
          createdAt: true,
          categories: true,
          tags: { select: { tagname: true } },
          imageUrls: true,
          curations: true,
        },
      });

      const transformedCategories = updatedStyle.categories.reduce(
        (object, { type, name, brand, price }) => {
          object[type.toLowerCase()] = {
            name,
            brand,
            price,
          };
          return object;
        },
        {}
      );

      updatedStyle.categories = transformedCategories;
      const curationCount = updatedStyle.curations.length;

      res.json({
        ...updatedStyle,
        tags: updatedStyle.tags.map((tag) => tag.tagname),
        curationCount,
      });
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

styleRouter
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(page);
      const sortBy = req.query.sortBy || "latest";
      const searchBy = req.query.searchBy || "title";
      const keyword = req.query.keyword || "";
      const tag = req.query.tag || "";
      assert(req.query, ValidQuery);

      const skip = (page - 1) * pageSize;
      const take = pageSize;

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
          search = { tags: { some: { tagname: keyword } } };
          break;
        default:
          const e = new Error();
          e.name = "BadQuery";
          throw e;
      }

      const styles = await prisma.style.findMany({
        where: { ...search },
        select: {
          id: true,
          nickname: true,
          title: true,
          content: true,
          viewCount: true,
          createdAt: true,
          categories: true,
          tags: { select: { tagname: true } },
          imageUrls: true,
          curations: true,
        },
      });

      styles.forEach((item) => {
        item.categories = item.categories.reduce(
          (object, { type, name, brand, price }) => {
            object[type.toLowerCase()] = {
              name,
              brand,
              price,
            };
            return object;
          },
          {}
        );
        item.tags = item.tags.map((tag) => tag.tagname);
        item.curationCount = item.curations.length;
        delete item.curations;
        delete item.password;
        item.thumbnail = item.imageUrls[0] ? item.imageUrls[0] : "";
        delete item.imageUrls;
      });

      const orderByOptions = {
        latest: (a, b) => b.createdAt - a.createdAt,
        mostViewed: (a, b) => b.viewCount - a.viewCount,
        mostCurated: (a, b) => b.curationCount - a.curationCount,
      };

      const orderBy = orderByOptions[sortBy] || orderByOptions["total"];
      styles.sort(orderBy);

      const paginatedStyles = styles.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      const totalItemCount = styles.length;
      const totalPages = Math.ceil(totalItemCount / pageSize);
      res.json({
        currentPage,
        totalPages,
        totalItemCount,
        data: paginatedStyles,
      });
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateStyle);
      Object.values(req.body.categories).forEach((item) =>
        assert(item, CreateCategories)
      );

      const isolatedArray = isolateCategoriesTagsArray(req.body);
      let newStyle;
      const tagsData = isolatedArray.tagsReqArray
        ? {
            tags: {
              connectOrCreate: isolatedArray.tagsInputArray,
            },
          }
        : undefined;

      newStyle = await prisma.style.create({
        data: {
          ...req.body,
          categories: {
            create: isolatedArray.categoriesInputArray,
          },
          ...(tagsData && tagsData),
        },
        select: {
          id: true,
          nickname: true,
          title: true,
          content: true,
          viewCount: true,
          createdAt: true,
          categories: true,
          tags: true,
          imageUrls: true,
        },
      });
      newStyle.curationCount = 0;

      res.status(201).json(newStyle);
    })
  );

export default styleRouter;
