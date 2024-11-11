import { redirect } from "@i18n/routing";
import { currentUser } from "@saas/auth/lib/current-user";
import { UserContextProvider } from "@saas/auth/lib/user-context";
import { Footer } from "@saas/shared/components/Footer";
import { NavBar } from "@saas/shared/components/NavBar";
import { getLocale } from "next-intl/server";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: PropsWithChildren) {
	const locale = await getLocale();
	const { user, teamMembership } = await currentUser();

	if (!user) {
		return redirect({ href: "/auth/login", locale });
	}

	if (!user.onboardingComplete || !user.teamMemberships?.length) {
		return redirect({ href: "/onboarding", locale });
	}

	if (!teamMembership) {
		return redirect({ href: "/", locale });
	}

	return (
		<UserContextProvider initialUser={user} teamMembership={teamMembership}>
			<NavBar
				user={user}
				teams={user.teamMemberships?.map((membership) => membership.team) ?? []}
			/>
			<main className="min-h-[calc(100vh-12rem)]">{children}</main>
			<Footer />
		</UserContextProvider>
	);
}
