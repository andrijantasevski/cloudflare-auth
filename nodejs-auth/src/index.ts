import * as express from "express";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import { env } from "./env";
import * as cors from "cors";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const port = 3000;

const userLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors({ credentials: true, origin: true }));

app.post("/api/login", async (request, response) => {
  const parsedRequestBody = userLoginSchema.safeParse(request.body);

  if (!parsedRequestBody.success) {
    return response.status(404).json("Invalid credentials.");
  }

  const { email, password } = parsedRequestBody.data;

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const { id } = await prisma.user.create({ data: { email, password: hashedPassword } });

  const token = jwt.sign({ exp: 1, id }, env.JWT_SECRET);

  return response
    .cookie("access_token", token, { maxAge: 1000 * 60 * 10, sameSite: "lax" })
    .status(200)
    .json("200 OK");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
