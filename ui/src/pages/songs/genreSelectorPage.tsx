import React, { useEffect, useState } from "react";
import { Tag, Tags } from "./tagsService";
import styled from "styled-components";
import { NavigateFunction } from "react-router-dom";
import { ListItem } from "../../components/lists";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { setBackButtonLocation } from "../../components/navPanel";
import { LoadStatus, LoadStatuses } from "../common/loading";
import { ReturnOrError, StatusCodes } from "../../services/common";
import { RegistrationForm } from "../../components/registrationForm";
import { RegisterUser } from "../../services/userService";

export type GetTags = () => Promise<ReturnOrError<Tags>>;

export const TagsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TagsView = ({
  tags,
  nav,
  registerUser,
}: {
  tags: Tags;
  nav: NavigateFunction;
  registerUser: RegisterUser;
}) => {
  const TagView = (tag: Tag, index: number) => {
    const tagValue = `${tag.name}=${tag.value}`;
    return (
      <ListItem
        aria-label={`tag::${tag.name}=${tag.value}`}
        key={`tag::${tagValue}`}
        onClick={() => nav(`/tags/${tag.id}/songs`)}
        data-index={index}
        data-tag-name={tag.name}
        data-tag-value={tag.value}
        role={"listitem"}
      >
        {tag.value}
      </ListItem>
    );
  };

  return (
    <>
      <TagsPanel role={"list"} aria-label={"tag-list"}>
        {tags.page.map((tag, i) => TagView(tag, i))}
      </TagsPanel>
    </>
  );
};

export const GenreSelectorPage = ({
  getGenres,
  nav,
  registerUser,
}: {
  getGenres: GetTags;
  nav: NavigateFunction;
  registerUser: RegisterUser;
}) => {
  const [loadStatus, setLoadStatus] = useState<LoadStatus<Tags>>(
    LoadStatuses.UNINITIALIZED,
  );

  useEffect(() => {
    if (loadStatus.name == LoadStatuses.UNINITIALIZED.name) {
      (async () => {
        setLoadStatus(LoadStatuses.LOADING);
        await loadTagList();
      })();
    }
  }, undefined);

  const loadTagList = async () => {
    const maybeSongsForTag = await getGenres();

    if (maybeSongsForTag.status == StatusCodes.REGISTRATION_REQUIRED) {
      setLoadStatus(LoadStatuses.REGISTRATION_REQUIRED);
    } else if (maybeSongsForTag.status == "OK" && maybeSongsForTag.value) {
      setLoadStatus({
        data: {
          page: maybeSongsForTag.value.page,
        },
        name: "loaded",
      });
    }
  };

  setBackButtonLocation(window.location.pathname);

  let panel;
  if (loadStatus.name == LoadStatuses.LOADING.name) {
    panel = <LoadingMessagePanel />;
  } else if (loadStatus.name == LoadStatuses.REGISTRATION_REQUIRED.name) {
    panel = (
      <RegistrationForm
        registerUser={registerUser}
        onLogin={() => {
          setLoadStatus(LoadStatuses.UNINITIALIZED);
        }}
      />
    );
  } else if (loadStatus.name == "loaded") {
    if (loadStatus?.data) {
      panel = (
        <TagsView
          tags={loadStatus.data}
          nav={nav}
          registerUser={registerUser}
        />
      );
    } else {
      panel = <EmptyPanel />;
    }
  } else {
    // TODO: Can we eliminate this case with better typing?
    panel = <EmptyPanel />;
  }

  return <>{panel}</>;
};

const EmptyPanel = () => {
  return (
    <>
      <div role={"note"} aria-label={"empty-songlist"} className="message">
        No genres have been loaded.
      </div>
    </>
  );
};
