import axios from "axios";

const SECURITY_HEADERS = [
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "content-security-policy",
  "referrer-policy",
  "permissions-policy",
];

export async function fetchSecurityData(url) {
  try {
    const res = await axios.get(url, {
      timeout: 12000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditBot/1.0)" },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const found = {};
    for (const h of SECURITY_HEADERS) {
      if (res.headers[h]) found[h] = res.headers[h];
    }

    const presentCount = Object.keys(found).length;
    const score = Math.round((presentCount / SECURITY_HEADERS.length) * 100);
    const grade =
      score >= 83
        ? "A"
        : score >= 66
        ? "B"
        : score >= 50
        ? "C"
        : score >= 33
        ? "D"
        : "F";

    return {
      headers: found,
      presentCount,
      totalChecks: SECURITY_HEADERS.length,
      score,
      grade,
    };
  } catch (err) {
    return {
      headers: {},
      presentCount: 0,
      totalChecks: SECURITY_HEADERS.length,
      score: 0,
      grade: "F",
      error: err.message,
    };
  }
}
