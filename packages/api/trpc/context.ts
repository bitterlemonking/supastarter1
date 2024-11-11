import { type Locale, config } from "@config";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { validateSessionToken } from "auth";
import { db } from "database";
import { cookies } from "next/headers";
import { getSignedUrl } from "storage";
import { defineAbilitiesFor } from "../modules/auth/abilities";

export async function createContext(
	params?: FetchCreateContextFnOptions | { isAdmin?: boolean },
) {
	const cookieStore = await cookies();
	const sessionId =
		cookieStore.get(config.auth.sessionCookieName)?.value ?? null;
	const { user, session } = sessionId
		? await validateSessionToken(sessionId)
		: { user: null, session: null };

	const teamMemberships = user
		? await Promise.all(
				(
					await db.teamMembership.findMany({
						where: {
							userId: user.id,
						},
						include: {
							team: true,
						},
					})
				).map(async (membership) => ({
					...membership,
					team: {
						...membership.team,
						avatarUrl: membership.team.avatarUrl
							? await getSignedUrl(membership.team.avatarUrl, {
									bucket: process.env.NEXT_PUBLIC_AVATARS_BUCKET_NAME as string,
									expiresIn: 360,
								})
							: null,
					},
				})),
			)
		: null;

	const abilities = defineAbilitiesFor({
		user,
		teamMemberships,
	});

	const locale = (cookieStore.get(config.i18n.localeCookieName)?.value ??
		config.i18n.defaultLocale) as Locale;

	return {
		user,
		session,
		locale,
		abilities,
		teamMemberships,
		responseHeaders:
			params && "resHeaders" in params ? params.resHeaders : undefined,
		isAdmin: params && "isAdmin" in params ? params.isAdmin : false,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
