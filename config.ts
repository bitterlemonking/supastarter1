export const config = {
	i18n: {
		locales: {
			en: {
				currency: "USD",
				label: "English",
			},
			de: {
				currency: "USD",
				label: "Deutsch",
			},
		},
		defaultLocale: "en",
		defaultCurrency: "USD",
		localeCookieName: "NEXT_LOCALE",
	},
	teams: {
		avatarColors: ["#4e6df5", "#e5a158", "#9dbee5", "#ced3d9"],
	},
	auth: {
		redirectAfterLogout: "/",
		sessionCookieName: "auth_session",
		sessionCookieMaxAge: 60 * 60 * 24 * 30,
	},
	mailing: {
		provider: "plunk",
		from: "hello@your-domain.com",
	},
	ui: {
		enabledThemes: ["light", "dark"],
		defaultTheme: "light",
	},
} as const satisfies Config;

export type Config = {
	i18n: {
		locales: { [locale: string]: { currency: string; label: string } };
		defaultLocale: string;
		defaultCurrency: string;
		localeCookieName: string;
	};
	teams: { avatarColors: string[] };
	auth: {
		redirectAfterLogout: string;
		sessionCookieName: string;
		sessionCookieMaxAge: number;
	};
	mailing: {
		provider:
			| "custom"
			| "console"
			| "plunk"
			| "resend"
			| "postmark"
			| "nodemailer";
		from: string;
	};
	ui: {
		enabledThemes: Array<"light" | "dark">;
		defaultTheme: Config["ui"]["enabledThemes"][number];
	};
};

export type Locale = keyof (typeof config)["i18n"]["locales"];
