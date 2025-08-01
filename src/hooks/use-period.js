import { getTodayRange } from "src/sections/payment/utils";

export const getInitialFilters = (FILTER_KEY) => {
  const saved = localStorage.getItem(FILTER_KEY);
  const { periodFrom, periodTo } = getTodayRange();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        periodFrom: parsed.periodFrom ?? periodFrom,
        periodTo: parsed.periodTo ?? periodTo,
        search: parsed.search ?? '',
        filterFields: Array.isArray(parsed.filterFields) ? parsed.filterFields : [],
      };
    } catch {
      return { periodFrom, periodTo, search: '', filterFields: [] };
    }
  }
  return { periodFrom, periodTo, search: '', filterFields: [] };
}