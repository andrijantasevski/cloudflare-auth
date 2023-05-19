import express from "express";
import { z } from "zod";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { env } from "./env";
import cors from "cors";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";

const port = 3000;

const userLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const app = express();
const prisma = new PrismaClient();

app.use(cookieParser());
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));

app.get("/api/verify", async (request, response) => {
  const token = request.headers.authorization;

  console.log("Request has been made!");

  if (!token) {
    return response.status(400).json(null);
  }

  const tokenParts = token?.split(" ");

  try {
    const isTokenValid = jwt.verify(tokenParts[1], env.JWT_SECRET);

    return response.status(200).json(isTokenValid);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return response.status(404).json(null);
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return response.status(400).json(null);
    }

    return response.status(500).json(null);
  }
});

app.post("/api/login", async (request, response) => {
  const parsedRequestBody = userLoginSchema.safeParse(request.body);

  if (!parsedRequestBody.success) {
    return response.status(401).json("Please provide an email or password.");
  }
  const { email, password } = parsedRequestBody.data;

  const user = await prisma.user.findUnique({ where: { email: email } });

  if (!user) {
    return response.status(401).json("Invalid credentials.");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return response.status(401).json("Invalid credentials.");
  }

  const today = new Date().getTime();

  const oneDay = 24 * 60 * 60 * 1000;

  const tomorrow = today + oneDay;

  const token = jwt.sign({ exp: tomorrow, user_id: user.id, user_email: user.email }, env.JWT_SECRET);

  return response
    .cookie("access_token", token, { maxAge: 24 * 60 * 60 * 1000, sameSite: "lax" })
    .status(200)
    .json("200 OK");
});

app.post("/api/register", async (request, response) => {
  const parsedRequestBody = userLoginSchema.safeParse(request.body);

  if (!parsedRequestBody.success) {
    return response.status(401).json("Please provide an email or password.");
  }

  const { email, password } = parsedRequestBody.data;

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const { email: user_email, id } = await prisma.user.create({ data: { email, password: hashedPassword } });

  const token = jwt.sign({ exp: 1, user_id: id, user_email }, env.JWT_SECRET);

  return response
    .cookie("access_token", token, { maxAge: 1000 * 60 * 10, sameSite: "lax" })
    .status(200)
    .json("200 OK");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
