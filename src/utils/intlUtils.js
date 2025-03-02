const dTFOptions = {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
};
export const dateTimeFormatter = new Intl.DateTimeFormat("en-US", dTFOptions);
