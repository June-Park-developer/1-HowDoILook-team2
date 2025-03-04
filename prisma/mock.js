//  Style
export const STYLES = [
  {
    id: "f60a980c-85d1-4265-a6f1-8a962b9a8cce",
    title: "캐주얼 데일리룩",
    nickname: "fashionista01",
    password: "pass123",
    content: "편안한 캐주얼 스타일이에요!",
    tags: ["casual", "daily"],
    imageUrls: [
      "https://example.com/style1-1.jpg",
      "https://example.com/style1-2.jpg",
    ],
    viewCount: 120,
    createdAt: new Date("2024-02-01T12:00:00Z"),
  },
  {
    id: "fa4df6eb-d3b8-416e-bb33-9557b4db1ab0",
    title: "시크한 블랙 스타일",
    nickname: "blacklover",
    password: "pass456",
    content: "올 블랙 코디 추천합니다!",
    tags: ["chic", "black"],
    imageUrls: [
      "https://example.com/style2-1.jpg",
      "https://example.com/style2-2.jpg",
    ],
    viewCount: 250,
    createdAt: new Date("2024-02-05T15:30:00Z"),
  },
  {
    id: "31235284-ce9c-4830-8eb2-81e51c32cf52",
    title: "스트릿 패션 감성",
    nickname: "streetstyler",
    password: "pass789",
    content: "요즘 유행하는 스트릿 스타일입니다.",
    tags: ["street", "trendy"],
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
    id: "e36283f5-20dc-4c7a-9161-486a79ce5f2d",
    nickname: "reviewerA",
    password: "review123",
    content: "이 코디 정말 좋아요!",
    trendy: 9,
    personality: 8,
    practicality: 7,
    costEffectiveness: 6,
    createdAt: new Date("2024-02-02T13:00:00Z"),
    styleId: "f60a980c-85d1-4265-a6f1-8a962b9a8cce",
  },
  {
    id: "9867a7ec-60af-4210-8227-05292c58b2e8",
    nickname: "fashionguru",
    password: "guru456",
    content: "깔끔한 스타일이네요.",
    trendy: 8,
    personality: 7,
    practicality: 9,
    costEffectiveness: 5,
    createdAt: new Date("2024-02-06T16:00:00Z"),
    styleId: "fa4df6eb-d3b8-416e-bb33-9557b4db1ab0",
  },
  {
    id: "3e131844-0e2b-4df6-9d44-a384bbca5c4a",
    nickname: "trendylover",
    password: "trendy789",
    content: "완전 제 스타일이에요!",
    trendy: 10,
    personality: 9,
    practicality: 7,
    costEffectiveness: 8,
    createdAt: new Date("2024-02-11T11:00:00Z"),
    styleId: "31235284-ce9c-4830-8eb2-81e51c32cf52",
  },
];

// Comment
export const COMMENTS = [
  {
    id: "7a12fb93-52a4-41cd-8d64-ba5a6ab60400",
    password: "comment123",
    content: "저도 이 스타일 너무 좋아해요!",
    createdAt: new Date("2024-02-02T14:00:00Z"),
    curationId: "e36283f5-20dc-4c7a-9161-486a79ce5f2d",
  },
  {
    id: "342fe7fc-df3b-4d27-82bc-ec7bec7bd2cb",
    password: "comment456",
    content: "이런 코디 참고해야겠어요.",
    createdAt: new Date("2024-02-06T17:00:00Z"),
    curationId: "9867a7ec-60af-4210-8227-05292c58b2e8",
  },
  {
    id: "3ad13ff8-0298-4330-aba6-66f6f150d79f",
    password: "comment789",
    content: "스트릿 감성이 최고죠!",
    createdAt: new Date("2024-02-11T12:00:00Z"),
    curationId: "3e131844-0e2b-4df6-9d44-a384bbca5c4a",
  },
];

// StyleItem
export const CATEGORIES = [
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130001",
    type: "TOP",
    name: "화이트 오버핏 티셔츠",
    brand: "Uniqlo",
    price: 29.99,
    styleId: "f60a980c-85d1-4265-a6f1-8a962b9a8cce",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130002",
    type: "BOTTOM",
    name: "청바지",
    brand: "Levi's",
    price: 59.99,
    styleId: "f60a980c-85d1-4265-a6f1-8a962b9a8cce",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130003",
    type: "SHOES",
    name: "화이트 스니커즈",
    brand: "Nike",
    price: 89.99,
    styleId: "f60a980c-85d1-4265-a6f1-8a962b9a8cce",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130004",
    type: "OUTER",
    name: "블랙 가죽 재킷",
    brand: "Zara",
    price: 119.99,
    styleId: "fa4df6eb-d3b8-416e-bb33-9557b4db1ab0",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130005",
    type: "BAG",
    name: "미니 크로스백",
    brand: "Gucci",
    price: 249.99,
    styleId: "fa4df6eb-d3b8-416e-bb33-9557b4db1ab0",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130006",
    type: "ACCESSORY",
    name: "실버 체인 목걸이",
    brand: "Silver925",
    price: 39.99,
    styleId: "fa4df6eb-d3b8-416e-bb33-9557b4db1ab0",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130007",
    type: "DRESS",
    name: "오버핏 후드 원피스",
    brand: "Adidas",
    price: 79.99,
    styleId: "31235284-ce9c-4830-8eb2-81e51c32cf52",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130008",
    type: "BOTTOM",
    name: "조거 팬츠",
    brand: "Nike",
    price: 69.99,
    styleId: "31235284-ce9c-4830-8eb2-81e51c32cf52",
  },
  {
    id: "c81e728d-9e1b-11eb-a8b3-0242ac130009",
    type: "SHOES",
    name: "하이탑 스니커즈",
    brand: "Converse",
    price: 99.99,
    styleId: "31235284-ce9c-4830-8eb2-81e51c32cf52",
  },
];
