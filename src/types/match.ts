export interface User {
  countryCode: string;
  flag: string;
  id: number;
  name: string;
  parentArea: string;
  parentAreaId: number;
}

export interface MatchType {
  id: number;
  childAreas: User[];
}

export interface homeTeam {
  id: number;
  name: string;
  shortName: string;
  crest: string;
}

export interface awayTeam {
  id: number;
  name: string;
  shortName: string;
  crest: string;
}

export interface live {
  id: number;
  homeTeam: homeTeam;
  awayTeam: awayTeam;
  status: string;
  utcDate: number;
}

export interface liveMatch {
  matches: live[];
}
