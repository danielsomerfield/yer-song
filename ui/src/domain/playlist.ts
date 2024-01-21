import { SongWithVotes } from "./song";
import { ReturnOrError } from "../services/common";

export type GetPlaylist = () => Promise<ReturnOrError<Playlist>>;

export type Playlist = {
  songs: {
    page: SongWithVotes[];
  };
};
