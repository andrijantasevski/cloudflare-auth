import { cookies } from "next/dist/client/components/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  if (!req.cookies.has("access_token")) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token");

  const response = await fetch("http://localhost:3000/api/verify", {
    headers: {
      Authorization: `Bearer ${accessToken?.value}`,
    },
    credentials: "include",
  });

  const session = await response.json();

  const requestUrl = new URL(req.url);

  if (!session && requestUrl.pathname === "/") {
    const newUrl = req.nextUrl.clone();

    newUrl.pathname = "/sign-in";

    return NextResponse.redirect(newUrl);
  }
}

export const config = {
  matcher: "/:path*",
};
