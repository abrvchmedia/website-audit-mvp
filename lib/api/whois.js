import axios from "axios";
import { getDomainAgeScore } from "@/utils/scoring";

export async function fetchWhoisData(domain) {
  try {
    const cleanDomain = domain.replace(/^www\./, "");
    const res = await axios.get(`https://rdap.org/domain/${cleanDomain}`, {
      timeout: 10000,
      headers: { Accept: "application/json" },
    });

    const events = res.data.events || [];
    const regEvent = events.find((e) => e.eventAction === "registration");
    const createdDate = regEvent?.eventDate || null;
    const domainAgeScore = getDomainAgeScore(createdDate);

    let ageYears = null;
    if (createdDate) {
      ageYears = (
        (Date.now() - new Date(createdDate).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
      ).toFixed(1);
    }

    return { createdDate, domainAgeScore, ageYears, domain: cleanDomain };
  } catch {
    return { createdDate: null, domainAgeScore: 40, ageYears: null, domain };
  }
}
