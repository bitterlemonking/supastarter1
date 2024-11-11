import { redirect } from "@i18n/routing";
import { currentUser } from "@saas/auth/lib/current-user";
import { ChangeNameForm } from "@saas/settings/components/ChangeNameForm";
import { ChangePasswordForm } from "@saas/settings/components/ChangePassword";
import { DeleteAccountForm } from "@saas/settings/components/DeleteAccountForm";
import { UserAvatarForm } from "@saas/settings/components/UserAvatarForm";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.account.title"),
	};
}

export default async function AccountSettingsPage() {
	const locale = await getLocale();
	const { user } = await currentUser();

	if (!user) {
		return redirect({ href: "/auth/login", locale });
	}

	return (
		<div className="grid gap-6">
			<UserAvatarForm />
			<ChangeNameForm initialValue={user.name ?? ""} />
			<ChangePasswordForm />
			<DeleteAccountForm />
		</div>
	);
}
