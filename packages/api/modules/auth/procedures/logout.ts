import { TRPCError } from "@trpc/server";
import { createSessionCookie, invalidateSession } from "auth";
import { logger } from "logs";
import { z } from "zod";
import { protectedProcedure } from "../../../trpc/base";

export const logout = protectedProcedure
	.input(z.void())
	.mutation(async ({ ctx: { session, responseHeaders } }) => {
		try {
			await invalidateSession(session.id);
			responseHeaders?.append(
				"Set-Cookie",
				createSessionCookie(null).serialize(),
			);
		} catch (e) {
			logger.error(e);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
			});
		}
	});
