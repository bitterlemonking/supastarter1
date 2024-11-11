import { TRPCError } from "@trpc/server";
import {
	createSession,
	createSessionCookie,
	generateSessionToken,
	validateVerificationToken,
} from "auth";
import { db } from "database";
import { logger } from "logs";
import { z } from "zod";
import { publicProcedure } from "../../../trpc/base";

export const verifyToken = publicProcedure
	.input(
		z.object({
			token: z.string(),
		}),
	)
	.mutation(async ({ input: { token }, ctx: { responseHeaders } }) => {
		try {
			const userId = await validateVerificationToken({
				token,
			});

			const user = await db.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
				});
			}

			if (!user.emailVerified) {
				await db.user.update({
					where: { id: user.id },
					data: {
						emailVerified: true,
					},
				});
			}

			const sessionToken = generateSessionToken();
			await createSession(sessionToken, userId);

			responseHeaders?.append(
				"Set-Cookie",
				createSessionCookie(sessionToken).serialize(),
			);
		} catch (e) {
			logger.error(e);

			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid token",
			});
		}
	});
