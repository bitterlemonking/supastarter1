import { redirect } from "@i18n/routing";
import { currentUser } from "@saas/auth/lib/current-user";
import { createApiCaller } from "api/trpc/caller";
import { getLocale } from "next-intl/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
	const locale = await getLocale();
	const url = new URL(request.url);
	const code = url.searchParams.get("code");

	if (!code) {
		return redirect({ href: "/", locale });
	}

	const apiCaller = await createApiCaller();
	const { user } = await currentUser();

	const invitation = await apiCaller.team.invitationById({
		id: code,
	});

	if (!invitation) {
		return redirect({ href: "/", locale });
	}

	if (!user) {
		return redirect({
			href: `/auth/login?invitationCode=${invitation.id}&email=${encodeURIComponent(
				invitation.email,
			)}`,
			locale,
		});
	}

	const team = await apiCaller.team.acceptInvitation({
		id: code,
	});

	if (!team) {
		return redirect({ href: "/", locale });
	}

	return redirect({ href: "/app/dashboard", locale });
}
