import styled from "styled-components";
import * as Toast from "@radix-ui/react-toast";
import { ToastProps } from "@radix-ui/react-toast";
import { SongWithVotes } from "../../domain/song";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { Maybe } from "../../util/maybe";

export const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  overflow-wrap: break-word;
`;
export const ArtistName = styled.h1`
  font-size: 1em;
  text-align: center;
`;
export const SongContainer = styled.div`
  text-align: center;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 1.5em;
`;
export const Song = styled.div`
  margin: 2vh 3vh 0 3vh;
  padding: 0 2% 2% 2%;
  border: 5px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, #b640ff, #90e7b3);
  overflow: hidden;
  max-height: 65%;
`;

export const OnPlayListPanel = styled.div`
  font-size: 1em;
  text-align: center;
  font-style: italic;
`;

export const ToastPopup = ({
  toastOpen,
  setToastOpen,
  song,
}: {
  toastOpen: boolean;
  setToastOpen: ToastProps["onOpenChange"];
  song: SongWithVotes;
}) => (
  <Toast.Root className={"Toast"} open={toastOpen} onOpenChange={setToastOpen}>
    <Toast.Description>
      {song?.voters.length > 0
        ? "Your vote has been added"
        : "Your song has been added to the playlist"}
    </Toast.Description>
  </Toast.Root>
);

export type GetSong = (id: string) => Promise<SongWithVotes | undefined>;

export interface SongPageProperties extends PropsWithChildren {
  song: SongWithVotes;
}

export const SongPage = (properties: SongPageProperties) => {
  const [toastOpen, setToastOpen] = useState(false);

  const { song, children } = properties;

  if (!song) {
    return <LoadingMessagePanel />;
  }

  return song ? (
    <>
      {children}
      <ToastPopup
        toastOpen={toastOpen}
        setToastOpen={setToastOpen}
        song={song}
      />
    </>
  ) : (
    <SongNotFound />
  );
};

export const SongNotFound = () => {
  return <div>The song was not found</div>;
};
export const useSong = (songId: string, getSong: GetSong) => {
  const [song, setSong] = useState<Maybe<SongWithVotes> | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);
  useEffect(() => {
    async function refreshSong() {
      if (!songId) {
        setSong(undefined);
      } else {
        const song = await getSong(songId);
        setSong(song);
      }
    }

    if (!loadStarted) {
      setLoadStarted(true);
      (async () => {
        await refreshSong();
        setInterval(async () => {
          await refreshSong();
        }, 10 * 1000);
      })();
    }
  }, []);
  return song;
};
