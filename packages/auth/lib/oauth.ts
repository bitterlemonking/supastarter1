import { OAuth2RequestError } from "arctic";
import { db } from "database";
import { logger } from "logs";
import { cookies } from "next/headers";
import { createSessionCookie } from "./cookies";
import { createSession, generateSessionToken } from "./sessions";

export function createOauthRedirectHandler(
	providerId: string,
	createAuthorizationTokens: () => {
		state: string;
		codeVerifier?: string;
		url: URL;
	},
) {
	return async () => {
		const cookieStore = await cookies();
		const { url, state, codeVerifier } = createAuthorizationTokens();

		cookieStore.set(`${providerId}_oauth_state`, state, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			path: "/",
			maxAge: 60 * 60,
			sameSite: "lax",
		});

		if (codeVerifier) {
			// store code verifier as cookie
			cookieStore.set("code_verifier", codeVerifier, {
				secure: true, // set to false in localhost
				path: "/",
				httpOnly: true,
				maxAge: 60 * 10, // 10 min
			});
		}

		return Response.redirect(url);
	};
}

export function createOauthCallbackHandler(
	providerId: string,
	validateAuthorizationCode: (
		code: string,
		codeVerifier?: string,
	) => Promise<{
		email: string;
		name?: string;
		id: string;
		avatar?: string;
	}>,
) {
	return async (req: Request) => {
		const cookieStore = await cookies();
		const url = new URL(req.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const storedState =
			cookieStore.get(`${providerId}_oauth_state`)?.value ?? null;
		const storedCodeVerifier = cookieStore.get("code_verifier")?.value ?? null;

		if (!code || !state || !storedState || state !== storedState) {
			logger.error(
				`Invalid state or code parameters for provider ${providerId}`,
			);

			return new Response(null, {
				status: 400,
			});
		}

		try {
			const oauthUser = await validateAuthorizationCode(
				code,
				storedCodeVerifier ?? undefined,
			);

			const existingUser = await db.user.findFirst({
				where: {
					OR: [
						{
							oauthAccounts: {
								some: {
									providerId,
									providerUserId: oauthUser.id,
								},
							},
						},
						{
							email: oauthUser.email.toLowerCase(),
						},
					],
				},
				select: {
					id: true,
					oauthAccounts: {
						select: {
							providerId: true,
						},
					},
				},
			});

			if (existingUser) {
				if (
					!existingUser.oauthAccounts.some(
						(account) => account.providerId === providerId,
					)
				) {
					await db.userOauthAccount.create({
						data: {
							providerId,
							providerUserId: oauthUser.id,
							userId: existingUser.id,
						},
					});
				}

				const sessionToken = generateSessionToken();
				await createSession(sessionToken, existingUser.id);
				cookieStore.set(createSessionCookie(sessionToken));

				return new Response(null, {
					status: 302,
					headers: {
						Location: "/app",
					},
				});
			}

			const newUser = await db.user.create({
				data: {
					email: oauthUser.email.toLowerCase(),
					emailVerified: true,
					name: oauthUser.name,
					avatarUrl: oauthUser.avatar,
				},
			});

			await db.userOauthAccount.create({
				data: {
					providerId,
					providerUserId: oauthUser.id,
					userId: newUser.id,
				},
			});
			const sessionToken = generateSessionToken();
			await createSession(sessionToken, newUser.id);
			cookieStore.set(createSessionCookie(sessionToken));

			return new Response(null, {
				status: 302,
				headers: {
					Location: "/app",
				},
			});
		} catch (e) {
			logger.error("Could not handle oAuth request", e);

			if (e instanceof OAuth2RequestError) {
				return new Response(null, {
					status: 400,
				});
			}

			return new Response(null, {
				status: 500,
			});
		}
	};
}
