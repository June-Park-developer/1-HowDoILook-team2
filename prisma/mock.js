//  Style
export const STYLES = [
  {
    id: 0,
    title: "캐주얼 데일리룩",
    nickname: "fashionista01",
    password: "pass1234",
    content: "편안한 캐주얼 스타일이에요!",
    tags: {
      connectOrCreate: [
        {
          where: { tagname: "casual" }, // "casual"이 존재하면 연결, 없으면 새로 생성
          create: { tagname: "casual" }, // 새로 생성할 태그
        },
        {
          where: { tagname: "daily" }, // "daily"가 존재하면 연결, 없으면 새로 생성
          create: { tagname: "daily" }, // 새로 생성할 태그
        },
      ],
    },
    imageUrls: [
      "https://example.com/style1-1.jpg",
      "https://example.com/style1-2.jpg",
    ],
    viewCount: 120,
    createdAt: new Date("2024-02-01T12:00:00Z"),
  },
  {
    id: 1,
    title: "시크한 블랙 스타일",
    nickname: "blacklover",
    password: "pass4568",
    content: "올 블랙 코디 추천합니다!",
    tags: {
      connectOrCreate: [
        {
          where: { tagname: "chic" },
          create: { tagname: "chic" },
        },
        {
          where: { tagname: "black" },
          create: { tagname: "black" },
        },
      ],
    },
    imageUrls: [
      "https://example.com/style2-1.jpg",
      "https://example.com/style2-2.jpg",
    ],
    viewCount: 250,
    createdAt: new Date("2024-02-05T15:30:00Z"),
  },
  {
    id: 2,
    title: "스트릿 패션 감성",
    nickname: "streetstyler",
    password: "pass7890",
    content: "요즘 유행하는 스트릿 스타일입니다.",
    tags: {
      connectOrCreate: [
        {
          where: { tagname: "street" },
          create: { tagname: "street" },
        },
        {
          where: { tagname: "trendy" },
          create: { tagname: "trendy" },
        },
      ],
    },
    imageUrls: [
      "https://example.com/style3-1.jpg",
      "https://example.com/style3-2.jpg",
    ],
    viewCount: 340,
    createdAt: new Date("2024-02-10T10:15:00Z"),
  },
];

// Curation
export const CURATIONS = [
  {
    id: 0,
    nickname: "reviewerA",
    password: "review123",
    content: "이 코디 정말 좋아요!",
    trendy: 9,
    personality: 8,
    practicality: 7,
    costEffectiveness: 6,
    createdAt: new Date("2024-02-02T13:00:00Z"),
    styleId: 0,
  },
  {
    id: 1,
    nickname: "fashionguru",
    password: "guru4567",
    content: "깔끔한 스타일이네요.",
    trendy: 8,
    personality: 7,
    practicality: 9,
    costEffectiveness: 5,
    createdAt: new Date("2024-02-06T16:00:00Z"),
    styleId: 1,
  },
  {
    id: 2,
    nickname: "trendylover",
    password: "trendy789",
    content: "완전 제 스타일이에요!",
    trendy: 10,
    personality: 9,
    practicality: 7,
    costEffectiveness: 8,
    createdAt: new Date("2024-02-11T11:00:00Z"),
    styleId: 2,
  },
];

// Comment
export const COMMENTS = [
  {
    password: "comment123",
    content: "저도 이 스타일 너무 좋아해요!",
    createdAt: new Date("2024-02-02T14:00:00Z"),
    curationId: 0,
  },
  {
    password: "comment456",
    content: "이런 코디 참고해야겠어요.",
    createdAt: new Date("2024-02-06T17:00:00Z"),
    curationId: 1,
  },
  {
    password: "comment789",
    content: "스트릿 감성이 최고죠!",
    createdAt: new Date("2024-02-11T12:00:00Z"),
    curationId: 2,
  },
];

// StyleItem
export const CATEGORIES = [
  {
    type: "TOP",
    name: "화이트 오버핏 티셔츠",
    brand: "Uniqlo",
    price: 29.99,
    styleId: 0,
  },
  {
    type: "BOTTOM",
    name: "청바지",
    brand: "Levi's",
    price: 59.99,
    styleId: 0,
  },
  {
    type: "SHOES",
    name: "화이트 스니커즈",
    brand: "Nike",
    price: 89.99,
    styleId: 0,
  },
  {
    type: "OUTER",
    name: "블랙 가죽 재킷",
    brand: "Zara",
    price: 119.99,
    styleId: 1,
  },
  {
    type: "BAG",
    name: "미니 크로스백",
    brand: "Gucci",
    price: 249.99,
    styleId: 1,
  },
  {
    type: "ACCESSORY",
    name: "실버 체인 목걸이",
    brand: "Silver925",
    price: 39.99,
    styleId: 1,
  },
  {
    type: "DRESS",
    name: "오버핏 후드 원피스",
    brand: "Adidas",
    price: 79.99,
    styleId: 2,
  },
  {
    type: "BOTTOM",
    name: "조거 팬츠",
    brand: "Nike",
    price: 69.99,
    styleId: 2,
  },
  {
    type: "SHOES",
    name: "하이탑 스니커즈",
    brand: "Converse",
    price: 99.99,
    styleId: 2,
  },
];
