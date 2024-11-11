import { routing } from "@i18n/routing";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
	return intlMiddleware(req);
}

export const config = {
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
