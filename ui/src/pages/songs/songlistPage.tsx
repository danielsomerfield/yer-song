import React, { MouseEventHandler, useEffect, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { ListItem } from "../../components/lists";
import { NavPanel, setBackButtonLocation } from "../../components/navPanel";
import styled from "styled-components";
import { Song } from "../../domain/song";
import { LoadStatus, LoadStatuses } from "../common/loading";
import { RegistrationForm } from "../../components/registrationForm";
import { RegisterUser } from "../../services/userService";
import { ReturnOrError, StatusCodes } from "../../services/common";

interface Songs {
  page: Song[];
}

type GetSongsForTagId = (id: string) => Promise<ReturnOrError<Songs>>;

const SongListPanelWrapper = styled.div`
  overflow-y: scroll;
  height: 83%;
`;

const SongListPanel = ({
  songs,
  navigator,
}: {
  songs: Song[];
  navigator: NavigateFunction;
}) => {
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
  registerUser,
}: {
  getSongsForTagId: GetSongsForTagId;
  tagId: string;
  nav: NavigateFunction;
  registerUser: RegisterUser;
}) => {
  const [loadStatus, setLoadStatus] = useState<LoadStatus<Songs>>(
    LoadStatuses.UNINITIALIZED,
  );

  useEffect(() => {
    if (loadStatus.name == LoadStatuses.UNINITIALIZED.name) {
      (async () => {
        setLoadStatus(LoadStatuses.LOADING);
        await loadSongList();
      })();
    }
  }, undefined);

  const loadSongList = async () => {
    const maybeSongsForTag = await getSongsForTagId(tagId);

    if (maybeSongsForTag.status == StatusCodes.REGISTRATION_REQUIRED) {
      setLoadStatus(LoadStatuses.REGISTRATION_REQUIRED);
    } else if (maybeSongsForTag.status == "OK" && maybeSongsForTag.value) {
      setLoadStatus({
        data: {
          page: maybeSongsForTag.value.page.sort((s1, s2) =>
            s1.title.toLowerCase() < s2.title.toLowerCase() ? -1 : 1,
          ),
        },
        name: "loaded",
      });
    }
  };

  if (
    loadStatus == LoadStatuses.LOADING ||
    loadStatus == LoadStatuses.UNINITIALIZED
  ) {
    return <LoadingMessagePanel />;
  } else if (loadStatus == LoadStatuses.REGISTRATION_REQUIRED) {
    return (
      <RegistrationForm
        registerUser={registerUser}
        onLogin={() => {
          setLoadStatus(LoadStatuses.UNINITIALIZED);
        }}
      />
    );
  } else {
    if (loadStatus.data) {
      return <SongListPanel songs={loadStatus.data?.page} navigator={nav} />;
    } else {
      return <EmptyPanel />;
    }
  }
};

const defaultTag = "t:genre:ClassicPopRock";

export const SongListPage = ({
  registerUser,
  getSongsForTagId,
  nav,
}: {
  getSongsForTagId: GetSongsForTagId;
  nav: NavigateFunction;
  registerUser: RegisterUser;
}) => {
  const { tag } = useParams();
  if (!tag) {
    // This should not be possible, but handling, just in case
    console.error("No tag param was provided, redirecting to classic rock");
  }
  setBackButtonLocation(window.location.pathname);
  return (
    <>
      <SongListView
        getSongsForTagId={getSongsForTagId}
        tagId={tag || defaultTag}
        nav={nav}
        registerUser={registerUser}
      />
      <NavPanel nav={nav} />
    </>
  );
};

const EmptyPanel = () => {
  return (
    <>
      <div role={"note"} aria-label={"empty-songlist"} className="message">
        No songs have been loaded.
      </div>
    </>
  );
};
