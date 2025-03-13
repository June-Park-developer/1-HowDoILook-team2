import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

import swaggerUi from "swagger-ui-express";
import swaggerIntro from "./swagger/swagger-intro.json" with { type: "json" }
import swaggerFile from "./swagger/swagger-output.json" with { type: "json" };

import commentRouter from "./routes/comment.js";
import curationRouter from "./routes/curating.js";
import imageRouter from "./routes/image.js";
import styleRouter from "./routes/style.js";
import tagRouter from "./routes/tag.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const swaggerUrl = {
"servers": [
    {
      "url": process.env.RENDER_EXTERNAL_URL
    }
  ],
  "basePath": "/",
  "schemes": [process.env.PROTOCOL]
}

const swaggerSetting = {...swaggerIntro, ...swaggerUrl, ...swaggerFile }

app.use("/styles", styleRouter);

app.use("/comments", commentRouter);
app.use("/curations", curationRouter);

app.use("/images", imageRouter);
app.use("/download", express.static("files"));

app.use("/tags", tagRouter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSetting));

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
