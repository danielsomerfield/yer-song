import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { NavigateFunction } from "react-router-dom";
import { ListItem } from "../../components/lists";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { Song } from "../song";
import { NavPanel } from "../../components/navPanel";

type Playlist = {
  songs: {
    page: Song[];
  };
};

export type GetPlaylist = () => Promise<Playlist>;

export const SongsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PlaylistView = ({
  playlist,
  nav,
}: {
  playlist: Playlist;
  nav: NavigateFunction;
}) => {
  const SongView = (song: Song, index: number) => {
    return (
      <ListItem
        // onClick={}
        role={"listitem"}
        key={`song::${song.id}`}
        aria-label={`song: ${song.title}`}
        data-id={song.id}
      >
        {song.title}
      </ListItem>
    );
  };

  return (
    <>
      <SongsPanel role={"list"} aria-label={"tag-list"}>
        {playlist.songs.page.map((tag, i) => SongView(tag, i))}
      </SongsPanel>
    </>
  );
};

export const PlayListPage = ({
  getPlaylist,
  nav,
}: {
  getPlaylist: GetPlaylist;
  nav: NavigateFunction;
}) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  // TODO: refactor this loading pattern out. It's always the same
  useEffect(() => {
    if (!playlist) {
      if (!loadStarted) {
        setLoadStarted(true);
        (async () => {
          const playlist = await getPlaylist();
          console.log("playlist", playlist);
          setPlaylist(playlist);
        })();
      }
    }
  }, undefined);

  const panel = playlist ? (
    <PlaylistView playlist={playlist} nav={nav} />
  ) : (
    <LoadingMessagePanel />
  );
  return (
    <>
      {panel}
      <NavPanel />
    </>
  );
};
