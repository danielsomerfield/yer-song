import { User } from "./user";

export interface Song {
  id: string;
  title: string;
  artistName: string;
  voteCount: number;
  lockOrder: number;
}

export interface SongWithVotes extends Song {
  voters: User[];
}

export type Songs = Paginated<Song>;

export interface Paginated<T> {
  thisPage: string;
  nextPage?: string;
  page: T[];
}
