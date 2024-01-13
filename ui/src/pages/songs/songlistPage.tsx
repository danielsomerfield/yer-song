import React, { MouseEventHandler, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { ListItem } from "../../components/lists";
import { NavPanel, setBackButtonLocation } from "../../components/navPanel";
import styled from "styled-components";
import { Song } from "../../domain/song";

interface Songs {
  page: Song[];
}

type GetSongsForTagId = (id: string) => Promise<Songs>;

const SongListPanelWrapper = styled.div`
  overflow-y: scroll;
  height: 83%;
`;

const SongListPanel = (songs: Song[], navigator: NavigateFunction) => {
  // TODO: add test for navigation

  return (
    <SongListPanelWrapper className={"SongListPage.SongListPanelWrapper"}>
      {songs.map((song) => {
        const goToSong: MouseEventHandler = () => {
          navigator(`/songs/${song.id}`);
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
      })}
    </SongListPanelWrapper>
  );
};

export const SongListView = ({
  getSongsForTagId,
  tagId,
  nav,
}: {
  getSongsForTagId: GetSongsForTagId;
  tagId: string;
  nav: NavigateFunction;
}) => {
  const [loadStarted, setLoadStarted] = useState(false);
  const [songs, setSongs] = useState<Song[] | undefined>(undefined);

  let panel;
  if (songs) {
    panel = SongListPanel(songs, nav);
  } else if (!loadStarted) {
    setLoadStarted(true);
    (async () => {
      const songsForTag = await getSongsForTagId(tagId);
      setSongs(
        songsForTag.page.sort((s1, s2) => (s1.title < s2.title ? -1 : 1)),
      );
    })();
    panel = <LoadingMessagePanel />;
  } else {
    panel = <LoadingMessagePanel />;
  }
  // TODO (MVP): handle load failure case
  return panel;
};

export const SongListPage = ({
  getSongsForTagId,
  nav,
}: {
  getSongsForTagId: GetSongsForTagId;
  nav: NavigateFunction;
}) => {
  const { tag } = useParams();
  if (!tag) {
    // TODO (MVP): what do we do here?
    throw "NYI: no tag";
  }

  setBackButtonLocation(window.location.pathname);

  return (
    <>
      <SongListView getSongsForTagId={getSongsForTagId} tagId={tag} nav={nav} />

      <NavPanel nav={nav} />
    </>
  );
};
