import { Link } from "@i18n/routing";
import { redirect } from "@i18n/routing";
import { currentUser } from "@saas/auth/lib/current-user";
import { UserContextProvider } from "@saas/auth/lib/user-context";
import { OnboardingForm } from "@saas/onboarding/components/OnboardingForm";
import { Footer } from "@saas/shared/components/Footer";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { Logo } from "@shared/components/Logo";
import { getLocale, getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("onboarding.title"),
	};
}

export default async function OnboardingPage() {
	const locale = await getLocale();
	const { user } = await currentUser();

	if (!user) {
		return redirect({ href: "/auth/login", locale });
	}

	if (user.onboardingComplete) {
		return redirect({ href: "/app", locale });
	}

	return (
		<UserContextProvider initialUser={user}>
			<div className="flex min-h-screen w-full bg-card p-8">
				<div className="flex w-full flex-col items-center justify-between">
					<div className="container">
						<div className="flex items-center justify-between">
							<Link href="/" className="block">
								<Logo />
							</Link>

							<div className="flex items-center justify-end gap-2">
								<LocaleSwitch />
								<ColorModeToggle />
							</div>
						</div>
					</div>

					<div className="container w-full max-w-md">
						<OnboardingForm />
					</div>

					<Footer />
				</div>
			</div>
		</UserContextProvider>
	);
}
