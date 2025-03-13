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
          comment: true,
        },
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
      res.json({ currentPage, totalPages, totalItemCount, data: curations });
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
        },
      });
      const transformedCategories = style.categories.reduce(
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
      style.categories = transformedCategories;

      const curationCount = style.curations ? style.curations.length : 0;

      res.json({
        ...style,
        tags: style.tags.map((tag) => tag.tagname),
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

      // //카테고리 어레이, 태그 어레이

      // //기존태그 가져와서 저장 + 가져오는 김에 카테고리도
      // const existingTags = await prisma.style.findUnique({
      //   where: { id: styleId },
      //   select: {
      //     tags: {
      //       select: { name: true },
      //     },
      //   },
      // });
      // //새 태그와 비교
      // const existingTagNames = existingTags.tags.map((tag) => tag.name);
      // const newTagNames = tagsInputArray.map((tag) => tag.where.name);

      // // 3. `disconnect`할 `tags`를 찾아내기
      // const tagsToDisconnect = existingTagNames
      //   .filter((tag) => !newTagNames.includes(tag))
      //   .map((tag) => ({ name: tag }));

      // //새 카테고리와 비교

      // //카테고리 삭제

      // // 4. 업데이트 요청 (tags 연결 및 disconnect 처리)
      // const updatedStyle = await prisma.style.update({
      //   where: { id: styleId },
      //   data: {
      //     tags: {
      //       connectOrCreate: tagsInputArray, // 새로운 tags 연결
      //       disconnect: tagsToDisconnect, // 불일치하는 tags 해제
      //     },
      //   },
      //   select: {
      //     id: true,
      //     password: true,
      //     content: true,
      //     createdAt: true,
      //   },
      // });

      const tagRecords = await Promise.all(
        req.body.tags.map(async (tagname) => {
          return await prisma.tag.upsert({
            where: { tagname },
            update: {},
            create: { tagname },
          });
        })
      );
      // 태그는 잘 되어 있는 것 같고, category만 array로 바꾸어서 해야겠음..
      // 복사 시작
      const categoriesReqJson = req.body.categories;
      delete req.body.categories;
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

      // 복사의 끝
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
            create: categoriesInputArray,
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
      const curationCount = updatedStyle.curations
        ? updatedStyle.curations.length
        : 0;

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
