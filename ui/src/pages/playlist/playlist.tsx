import React, { MouseEventHandler, useEffect, useState } from "react";
import styled from "styled-components";
import { NavigateFunction } from "react-router-dom";
import { ListItem } from "../../components/lists";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { NavPanel, setBackButtonLocation } from "../../components/navPanel";
import { Song } from "../../domain/song";

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
  const SongView = (song: Song, i: number) => {
    const goToSong: MouseEventHandler = () => {
      nav(`/songs/${song.id}`);
    };
    return (
      <ListItem
        onClick={goToSong}
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
    setBackButtonLocation("/playlist");
    if (!playlist) {
      if (!loadStarted) {
        setLoadStarted(true);
        (async () => {
          const playlist = await getPlaylist();
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
      <div aria-label={"page-title"} role={"heading"}>
        Play list
      </div>
      {panel}
      <NavPanel nav={nav} />
    </>
  );
};
