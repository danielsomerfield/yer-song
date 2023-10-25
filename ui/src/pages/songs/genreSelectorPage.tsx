import React, { useEffect, useState } from "react";
import { Tag, Tags } from "./tagsService";
import { LoadingPanel } from "../../components/loadingPanel";
import styled from "styled-components";
import { NavigateFunction } from "react-router-dom";

export type GetTags = () => Promise<Tags>;
export const TagViewPanel = styled.div`
  height: 6dvh;

  &:hover {
    background-color: lightblue;
  }

  font-size: 4dvh;
  white-space: nowrap;
  overflow: clip;
  text-overflow: ellipsis;
  text-align: left;
  padding: 1dvh 0 1dvh 0;
`;

export const TagsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TagsView = (tags: Tags, nav: NavigateFunction) => {
  const TagView = (tag: Tag, index: number) => {
    const tagValue = `${tag.name}=${tag.value}`;
    return (
      <TagViewPanel
        aria-label={`tag::${tag.name}=${tag.value}`}
        key={`tag::${tagValue}`}
        onClick={() => nav(`/tags/${tag.id}/songs`)}
        data-index={index}
        data-tag-name={tag.name}
        data-tag-value={tag.value}
        role={"listitem"}
      >
        {tag.value}
      </TagViewPanel>
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
}: {
  getGenres: GetTags;
  nav: NavigateFunction;
}) => {
  const [tags, setTags] = useState<Tags | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  useEffect(() => {
    if (!loadStarted) {
      setLoadStarted(true);
      (async () => {
        const tags = await getGenres();
        setTags(tags);
      })();
    }
  }, undefined);

  if (!tags) {
    return <LoadingPanel />;
  }

  return TagsView(tags, nav);
};
