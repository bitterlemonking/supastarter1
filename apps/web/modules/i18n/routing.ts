import { config } from "@config";
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: Object.keys(config.i18n.locales),
	defaultLocale: config.i18n.defaultLocale,
	localePrefix: "never",
	localeCookie: {
		name: config.i18n.localeCookieName,
	},
});

export const { Link, redirect, usePathname, useRouter } = createNavigation({
	locales: Object.keys(config.i18n.locales),
	localePrefix: "never",
	localeCookie: {
		name: config.i18n.localeCookieName,
	},
});
