import { SongWithVotes } from "./song";

export type GetPlaylist = () => Promise<Playlist>;

export type Playlist = {
  songs: {
    page: SongWithVotes[];
  };
};
