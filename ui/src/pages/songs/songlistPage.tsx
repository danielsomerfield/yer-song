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
            s1.title < s2.title ? -1 : 1,
          ),
        },
        name: "loaded",
      });
    }
  };

  if (loadStatus.name == LoadStatuses.LOADING.name) {
    return <LoadingMessagePanel />;
  } else if (loadStatus.name == LoadStatuses.REGISTRATION_REQUIRED.name) {
    return (
      <RegistrationForm
        registerUser={registerUser}
        onLogin={() => {
          setLoadStatus(LoadStatuses.UNINITIALIZED);
        }}
      />
    );
  } else if (loadStatus.name == "loaded") {
    if (loadStatus?.data) {
      return <SongListPanel songs={loadStatus.data?.page} navigator={nav} />;
    } else {
      return <EmptyPanel />;
    }
  } else {
    // TODO: Can we eliminate this case with better typing?
    return <EmptyPanel />;
  }
};

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
    // TODO (MVP): what do we do here?
    throw "NYI: no tag";
  }

  setBackButtonLocation(window.location.pathname);

  return (
    <>
      <SongListView
        getSongsForTagId={getSongsForTagId}
        tagId={tag}
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
