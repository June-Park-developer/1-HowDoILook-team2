import * as s from "superstruct";

const pwPattern = s.pattern(s.string(), /(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}/);

const isIntegerBetween0And10 = (value) =>
  Number.isInteger(value) && value >= 0 && value <= 10;
const IntegerBetween0And10 = s.define(
  "IntegerBetween0And10",
  isIntegerBetween0And10
);

export const OrOverZeroString = s.refine(
  s.string(),
  "OrOverZeroString",
  (value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
  }
);

const OrOverZeroInteger = s.refine(s.number(), "OrOverZeroInteger", (value) => {
  return Number.isInteger(value) && value >= 0;
});

export const CreateCategories = s.object({
  name: s.size(s.string(), 1, 20),
  brand: s.size(s.string(), 1, 20),
  price: OrOverZeroInteger,
});

export const CreateStyle = s.object({
  nickname: s.size(s.string(), 1, 20),
  title: s.size(s.string(), 1, 20),
  content: s.size(s.string(), 1, 20),
  categories: s.any(),
  tags: s.optional(s.array(s.string())),
  imageUrls: s.array(s.string()),
  password: pwPattern,
});

export const PatchStyle = s.partial(CreateStyle);

export const CreateCuration = s.object({
  nickname: s.size(s.string(), 1, 20),
  content: s.size(s.string(), 1, 150),
  trendy: IntegerBetween0And10,
  personality: IntegerBetween0And10,
  practicality: IntegerBetween0And10,
  costEffectiveness: IntegerBetween0And10,
  password: pwPattern,
});

export const PatchCuration = s.partial(CreateCuration);

export const CreateComment = s.object({
  content: s.size(s.string(), 1, 150),
  password: pwPattern,
});

export const PositiveInteger = s.refine(
  s.string(),
  "PositiveInteger",
  (value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1;
  }
);

export const ValidQuery = s.object({
  page: s.optional(PositiveInteger),
  pageSize: s.optional(PositiveInteger),
  searchBy: s.optional(s.string()),
  keyword: s.optional(s.string()),
  sortBy: s.optional(s.string()),
  tag: s.optional(s.string()),
});

export const OptionalQuery = s.partial(ValidQuery);

export const Password = s.object({
  password: pwPattern,
});

const ValidTagname = s.refine(s.string(), "ValidTagname", (value) => {
  return /^[a-zA-Z0-9가-힣]{1,20}$/.test(value);
});

export const TagQuery = s.object({
  tagname: ValidTagname,
});
