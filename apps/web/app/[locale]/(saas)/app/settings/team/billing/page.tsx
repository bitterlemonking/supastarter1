import { redirect } from "@i18n/routing";
import { currentUser } from "@saas/auth/lib/current-user";
import { SubscriptionOverview } from "@saas/settings/components/SubscriptionOverview";
import { UpgradePlan } from "@saas/settings/components/UpgradePlan";
import { createApiCaller } from "api/trpc/caller";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.billing.title"),
	};
}

export default async function BillingSettingsPage() {
	const locale = await getLocale();
	const apiCaller = await createApiCaller();
	const plans = await apiCaller.billing.plans();
	const { user, team } = await currentUser();

	if (!user) {
		return redirect({ href: "/auth/login", locale });
	}

	if (!team) {
		return redirect({ href: "/app/dashboard", locale });
	}

	const teamSubscription = await apiCaller.team.subscription({
		teamId: team.id,
	});

	return (
		<div>
			<SubscriptionOverview
				plans={plans}
				currentSubscription={teamSubscription}
				className="mb-4"
			/>
			<UpgradePlan
				plans={plans}
				activePlanId={teamSubscription?.planId}
				teamId={team.id}
			/>
		</div>
	);
}
