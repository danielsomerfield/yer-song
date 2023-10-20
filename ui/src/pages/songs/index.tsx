import React, { useEffect, useState } from "react";
import { LoadingPanel } from "../../components/loadingPanel";
import styled from "styled-components";
import { Tag, Tags } from "./tagsService";

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

export const TagView = (tag: Tag) => {
  return (
    <TagViewPanel key={`tag::${tag.name}=${tag.value}`}>
      {tag.value}
    </TagViewPanel>
  );
};

export const TagsView = (tags: Tags) => {
  console.log(tags);
  return (
    <>
      <TagsPanel>{tags.page.map((tag) => TagView(tag))}</TagsPanel>
    </>
  );
};

export const SongSelectorPage = ({ getGenres }: { getGenres: GetTags }) => {
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

  return TagsView(tags);
};
