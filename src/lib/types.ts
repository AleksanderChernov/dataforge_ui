export type FilterOption = {
  quote: string;
  active: boolean;
  swap: boolean;
  future: boolean;
  spot: boolean;
  info: { status: string };
  symbol: string;
};

export type FilterConditions = {
  label: string;
  addedCheck: (symbol: FilterOption) => string | boolean;
}[];
