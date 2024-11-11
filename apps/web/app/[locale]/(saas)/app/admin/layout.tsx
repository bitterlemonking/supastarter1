import { redirect } from "@i18n/routing";
import { SideMenu } from "@saas/admin/component/SideMenu";
import { currentUser } from "@saas/auth/lib/current-user";
import { UserRoleSchema } from "database";
import { UsersIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
	const locale = await getLocale();
	const t = await getTranslations();
	const { user } = await currentUser();

	if (user?.role !== UserRoleSchema.Values.ADMIN) {
		redirect({ href: "/", locale });
	}

	return (
		<div className="container max-w-6xl py-8">
			<div className="flex flex-col items-start gap-8 md:flex-row">
				<div className="w-full md:max-w-[200px]">
					<SideMenu
						menuItems={[
							{
								title: t("admin.menu.users"),
								href: "users",
								icon: <UsersIcon className="size-4" />,
							},
						]}
					/>
				</div>

				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
}
