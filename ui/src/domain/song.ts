import { User } from "./users";

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

export interface Songs {
  page: Song[];
}
