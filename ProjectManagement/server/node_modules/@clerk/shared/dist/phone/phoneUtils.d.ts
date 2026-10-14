import { PhoneCodeChannel } from "../types/phoneCodeChannel.js";
import { CountryEntry, CountryIso } from "./countryCodeData.js";

//#region src/phone/phoneUtils.d.ts
declare function getFlagEmojiFromCountryIso(iso: CountryIso, fallbackIso?: string): string;
declare function getCountryIsoFromFormattedNumber(formattedNumber: string, fallbackIso?: string): string;
declare function formatPhoneNumber(phoneNumber: string, pattern: string | undefined, countryCode?: string): string;
declare function extractDigits(formattedPhone: string): string;
declare function parsePhoneString(str: string): {
  iso: "at" | "id" | "us" | "gb" | "in" | "ca" | "de" | "fr" | "ru" | "af" | "ax" | "al" | "dz" | "as" | "ad" | "ao" | "ai" | "ag" | "ar" | "am" | "aw" | "ac" | "au" | "az" | "bs" | "bh" | "bd" | "bb" | "by" | "be" | "bz" | "bj" | "bm" | "bt" | "bo" | "ba" | "bw" | "br" | "io" | "vg" | "bn" | "bg" | "bf" | "bi" | "kh" | "cm" | "cv" | "bq" | "ky" | "cf" | "td" | "cl" | "cn" | "co" | "km" | "cd" | "cg" | "ck" | "cr" | "ci" | "hr" | "cu" | "cw" | "cy" | "cz" | "dk" | "dj" | "dm" | "do" | "ec" | "eg" | "sv" | "gq" | "er" | "ee" | "et" | "fk" | "fo" | "fj" | "fi" | "gf" | "pf" | "ga" | "gm" | "ge" | "gh" | "gi" | "gr" | "gl" | "gd" | "gp" | "gu" | "gt" | "gn" | "gw" | "gy" | "ht" | "hn" | "hk" | "hu" | "is" | "ir" | "iq" | "ie" | "il" | "it" | "jm" | "jp" | "jo" | "kz" | "ke" | "ki" | "xk" | "kw" | "kg" | "la" | "lv" | "lb" | "ls" | "lr" | "ly" | "li" | "lt" | "lu" | "mo" | "mg" | "mw" | "my" | "mv" | "ml" | "mt" | "mh" | "mq" | "mr" | "mu" | "yt" | "mx" | "fm" | "md" | "mc" | "mn" | "me" | "ms" | "ma" | "mz" | "mm" | "na" | "nr" | "np" | "nl" | "nc" | "nz" | "ni" | "ne" | "ng" | "nu" | "nf" | "kp" | "mk" | "mp" | "no" | "om" | "pk" | "pw" | "ps" | "pa" | "pg" | "py" | "pe" | "ph" | "pl" | "pt" | "pr" | "qa" | "re" | "ro" | "rw" | "bl" | "sh" | "kn" | "lc" | "mf" | "pm" | "vc" | "ws" | "sm" | "st" | "sa" | "sn" | "rs" | "sc" | "sl" | "sg" | "sx" | "sk" | "si" | "sb" | "so" | "za" | "kr" | "ss" | "es" | "lk" | "sd" | "sr" | "sz" | "se" | "ch" | "sy" | "tw" | "tj" | "tz" | "th" | "tl" | "tg" | "tk" | "to" | "tt" | "tn" | "tr" | "tm" | "tc" | "tv" | "vi" | "ug" | "ua" | "ae" | "uy" | "uz" | "vu" | "va" | "ve" | "vn" | "wf" | "eh" | "ye" | "zm" | "zw";
  pattern: string;
  code: string;
  number: string;
  formattedNumberWithCode: string;
};
declare function stringToFormattedPhoneString(str: string): string;
declare const byPriority: (a: CountryEntry, b: CountryEntry) => number;
declare function getCountryFromPhoneString(phone: string): {
  number: string;
  country: CountryEntry;
};
declare function getPreferredPhoneCodeChannelByCountry(phoneNumber: string, preferredChannels: Record<string, PhoneCodeChannel>): PhoneCodeChannel | null;
//#endregion
export { byPriority, extractDigits, formatPhoneNumber, getCountryFromPhoneString, getCountryIsoFromFormattedNumber, getFlagEmojiFromCountryIso, getPreferredPhoneCodeChannelByCountry, parsePhoneString, stringToFormattedPhoneString };
//# sourceMappingURL=phoneUtils.d.ts.map