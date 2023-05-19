import { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  console.log(req.cookies.get("access_token")?.value);

  //
  // /api/auth/verify
}

export const config = {
  matcher: "/:path*",
};
