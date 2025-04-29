import express, { Response } from "express";
import { authRoutes } from "./routes/auth/route";
import cookieParser from "cookie-parser";
import { articleRouter } from "./routes/article/route";
import { categoryRouter } from "./routes/category/route";
const PORT = process.env.PORT ?? 3000;

const server = express();

server.use(express.json());
server.use(cookieParser());

server.get("/", (_, res: Response) => {
  res.json({
    message: "OK",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

server.use("/articles", articleRouter);
server.use("/categories", categoryRouter);
server.use("/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`🚀 App listening on port: ${PORT}`);
});
