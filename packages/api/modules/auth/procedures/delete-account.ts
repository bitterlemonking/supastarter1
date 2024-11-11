import { TRPCError } from "@trpc/server";
import { createSessionCookie } from "auth";
import { db } from "database";
import { logger } from "logs";
import { z } from "zod";
import { protectedProcedure } from "../../../trpc/base";

export const deleteAccount = protectedProcedure
	.input(z.void())
	.mutation(async ({ ctx: { responseHeaders, user } }) => {
		try {
			await db.user.delete({
				where: {
					id: user.id,
				},
			});

			await db.team.deleteMany({
				where: {
					memberships: {
						every: {
							userId: user.id,
						},
					},
				},
			});

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
