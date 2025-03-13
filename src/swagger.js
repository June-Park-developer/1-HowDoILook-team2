import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "2팀-How Do I Look",
    description:
      "이 프로젝트는 코드잇 Node.js 백엔드 스프린트의 초급 팀 프로젝트입니다.",
  },
  servers: [
    {
      url: `${process.env.RENDER_EXTERNAL_URL}:${process.env.PORT}`,
    },
  ],
  schemes: ["http"],
};

const outputFile = "./swagger/swagger-output.json";
const endpointsFiles = ["./app.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);
