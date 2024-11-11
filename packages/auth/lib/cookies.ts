import { config } from "@config";
import { type SerializeOptions, serialize } from "cookie";

export function createSessionCookie(
	sessionToken: string | null,
	options?: SerializeOptions,
) {
	const name = config.auth.sessionCookieName;
	const value = sessionToken ?? "";

	const cookieOptions: SerializeOptions = {
		secure: true,
		path: "/",
		httpOnly: true,
		maxAge: sessionToken ? config.auth.sessionCookieMaxAge : 0,
		...options,
	};

	return {
		name,
		value,
		...cookieOptions,
		serialize: () => serialize(name, value, cookieOptions),
	};
}
