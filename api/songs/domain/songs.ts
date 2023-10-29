export interface Song {
  id: string;
  title: string;
  artistName: string;
  voteCount: number;
}

export type Songs = Paginated<Song>;

export interface Paginated<T> {
  thisPage: string;
  nextPage?: string;
  page: T[];
}
