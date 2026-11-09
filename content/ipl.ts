/**
 * IPL reference figures, 2008 — 2024 (17 seasons, 1,095 matches).
 * Season match counts sum to 1,095 — the same total analysed in the project.
 * Career totals are public IPL records through the 2024 season.
 * ► Replace with the exact outputs of your own notebook if they differ.
 */

export type Datum = { label: string; value: number; note?: string };
export type IplView = { id: string; tab: string; metric: string; insight: string; data: Datum[] };

export const iplViews: IplView[] = [
  {
    id: "batters",
    tab: "BATTERS",
    metric: "CAREER RUNS",
    insight: "One batter sits alone past 8,000 — the next five are packed within ~1,600 runs.",
    data: [
      { label: "V Kohli", value: 8004 },
      { label: "S Dhawan", value: 6769 },
      { label: "RG Sharma", value: 6628 },
      { label: "DA Warner", value: 6565 },
      { label: "SK Raina", value: 5528 },
      { label: "MS Dhoni", value: 5243 },
      { label: "AB de Villiers", value: 5162 },
    ],
  },
  {
    id: "bowlers",
    tab: "BOWLERS",
    metric: "CAREER WICKETS",
    insight: "Spin dominates the top of the list — five of the top seven are spinners.",
    data: [
      { label: "YS Chahal", value: 205 },
      { label: "PP Chawla", value: 192 },
      { label: "DJ Bravo", value: 183 },
      { label: "B Kumar", value: 181 },
      { label: "SP Narine", value: 180 },
      { label: "R Ashwin", value: 180 },
      { label: "A Mishra", value: 174 },
    ],
  },
  {
    id: "teams",
    tab: "TEAMS",
    metric: "TITLES",
    insight: "Two franchises — CSK and MI — hold 10 of the 17 titles between them.",
    data: [
      { label: "CSK", value: 5 },
      { label: "MI", value: 5 },
      { label: "KKR", value: 3 },
      { label: "RR", value: 1 },
      { label: "Deccan Chargers", value: 1 },
      { label: "SRH", value: 1 },
      { label: "GT", value: 1 },
    ],
  },
  {
    id: "seasons",
    tab: "SEASONS",
    metric: "MATCHES PER SEASON",
    insight: "Expansion to 10 teams in 2022 lifted the season from 60 to 74 matches.",
    data: [
      { label: "2008", value: 58, note: "Champion · RR" },
      { label: "2009", value: 57, note: "Champion · Deccan Chargers" },
      { label: "2010", value: 60, note: "Champion · CSK" },
      { label: "2011", value: 73, note: "Champion · CSK" },
      { label: "2012", value: 74, note: "Champion · KKR" },
      { label: "2013", value: 76, note: "Champion · MI" },
      { label: "2014", value: 60, note: "Champion · KKR" },
      { label: "2015", value: 59, note: "Champion · MI" },
      { label: "2016", value: 60, note: "Champion · SRH" },
      { label: "2017", value: 59, note: "Champion · MI" },
      { label: "2018", value: 60, note: "Champion · CSK" },
      { label: "2019", value: 60, note: "Champion · MI" },
      { label: "2020", value: 60, note: "Champion · MI" },
      { label: "2021", value: 60, note: "Champion · CSK" },
      { label: "2022", value: 74, note: "Champion · GT" },
      { label: "2023", value: 74, note: "Champion · CSK" },
      { label: "2024", value: 71, note: "Champion · KKR" },
    ],
  },
];
