const require_countryCodeData = require('./countryCodeData.js');

//#region src/phone/phoneUtils.ts
const OFFSET = 127397;
const emojiCache = {};
function getFlagEmojiFromCountryIso(iso, fallbackIso = "us") {
	iso = iso || fallbackIso;
	if (emojiCache[iso]) return emojiCache[iso];
	const codePoints = [...iso.toUpperCase()].map((c) => c.codePointAt(0) + OFFSET);
	const res = String.fromCodePoint(...codePoints);
	emojiCache[iso] = res;
	return res;
}
function getCountryIsoFromFormattedNumber(formattedNumber, fallbackIso = "us") {
	const number = extractDigits(formattedNumber);
	if (!number || number.length < 4) return fallbackIso;
	if (number.startsWith("1") && phoneNumberBelongsTo("us", number)) return "us";
	if (number.startsWith("1") && phoneNumberBelongsTo("ca", number)) return "ca";
	return getCountryFromPhoneString(number).country.iso;
}
function formatPhoneNumber(phoneNumber, pattern, countryCode) {
	if (!phoneNumber || !pattern) return phoneNumber;
	const digits = [...extractDigits(phoneNumber)].slice(0, maxE164CompliantLength(countryCode));
	if (digits.length <= 3) return digits.join("");
	let res = "";
	for (let i = 0; digits.length > 0; i++) if (i > pattern.length - 1) res += digits.shift();
	else res += pattern[i] === "." ? digits.shift() : pattern[i];
	return res;
}
function extractDigits(formattedPhone) {
	return (formattedPhone || "").replace(/[^\d]/g, "");
}
function phoneNumberBelongsTo(iso, phoneWithCode) {
	if (!iso || !require_countryCodeData.IsoToCountryMap.get(iso) || !phoneWithCode) return false;
	const code = phoneWithCode[0];
	const subArea = phoneWithCode.substring(1, 4);
	return code === require_countryCodeData.IsoToCountryMap.get(iso)?.code && phoneWithCode.length - 1 === maxDigitCountForPattern(require_countryCodeData.IsoToCountryMap.get(iso)?.pattern || "") && require_countryCodeData.SubAreaCodeSets[iso].has(subArea);
}
function maxDigitCountForPattern(pattern) {
	return (pattern.match(/\./g) || []).length;
}
const MAX_PHONE_NUMBER_LENGTH = 15;
function maxE164CompliantLength(countryCode) {
	countryCode = countryCode || "1";
	return MAX_PHONE_NUMBER_LENGTH - (countryCode.includes("+") ? countryCode : "+" + countryCode).length;
}
function parsePhoneString(str) {
	const digits = extractDigits(str);
	const iso = getCountryIsoFromFormattedNumber(digits);
	const pattern = require_countryCodeData.IsoToCountryMap.get(iso)?.pattern || "";
	const code = require_countryCodeData.IsoToCountryMap.get(iso)?.code || "";
	const number = digits.slice(code.length);
	return {
		iso,
		pattern,
		code,
		number,
		formattedNumberWithCode: `+${code} ${formatPhoneNumber(number, pattern, code)}`
	};
}
function stringToFormattedPhoneString(str) {
	const parsed = parsePhoneString(str);
	return `+${parsed.code} ${formatPhoneNumber(parsed.number, parsed.pattern, parsed.code)}`;
}
const byPriority = (a, b) => {
	return b.priority - a.priority;
};
function getCountryFromPhoneString(phone) {
	const phoneWithCode = extractDigits(phone);
	const matchingCountries = [];
	for (const i of [
		4,
		3,
		2,
		1
	]) {
		const potentialCode = phoneWithCode.substring(0, i);
		const countries = require_countryCodeData.CodeToCountriesMap.get(potentialCode) || [];
		if (countries.length) matchingCountries.push(...countries);
	}
	const fallbackCountry = require_countryCodeData.IsoToCountryMap.get("us");
	const country = matchingCountries.sort(byPriority)[0] || fallbackCountry;
	return {
		number: phoneWithCode.slice(country?.code.length || 0),
		country
	};
}
function getPreferredPhoneCodeChannelByCountry(phoneNumber, preferredChannels) {
	if (!preferredChannels) return null;
	const { country } = getCountryFromPhoneString(phoneNumber);
	return preferredChannels[country.iso.toUpperCase()] || null;
}

//#endregion
exports.byPriority = byPriority;
exports.extractDigits = extractDigits;
exports.formatPhoneNumber = formatPhoneNumber;
exports.getCountryFromPhoneString = getCountryFromPhoneString;
exports.getCountryIsoFromFormattedNumber = getCountryIsoFromFormattedNumber;
exports.getFlagEmojiFromCountryIso = getFlagEmojiFromCountryIso;
exports.getPreferredPhoneCodeChannelByCountry = getPreferredPhoneCodeChannelByCountry;
exports.parsePhoneString = parsePhoneString;
exports.stringToFormattedPhoneString = stringToFormattedPhoneString;