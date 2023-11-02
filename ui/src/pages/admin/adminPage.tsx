import React, { PropsWithChildren, useEffect, useState } from "react";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { SongWithVotes } from "../../domain/song";
import styled from "styled-components";

const SongAdminButton = styled.button`
  margin: 1vh;
  font-size: 4vh;
  min-width: 8vh;
`;

const SongsPanel = styled.div`
  display: grid;
  justify-content: left;
  grid-column-gap: 3vh;
  grid-template-columns: 1fr 1fr auto auto;
  text-align: left;
`;

const SongPanel = styled.div`
  text-align: left;
  padding-left: 1vh;
`;

const SongItemControls = () => {
  return (
    <div>
      <SongAdminButton>Remove</SongAdminButton>
      <SongAdminButton>Up</SongAdminButton>
      <SongAdminButton>Down</SongAdminButton>
    </div>
  );
};

const SongItemRow = ({ song }: PropsWithChildren & { song: SongWithVotes }) => {
  return (
    <>
      <SongPanel>{song.title}</SongPanel>
      <RequestedBy>
        {song.voters.length > 0 ? song.voters[0].name : "unknown"}
      </RequestedBy>
      <div>{song.voteCount}</div>
      <SongItemControls />
    </>
  );
};

const RequestedBy = styled.div`
  margin-left: 1vh;
`;

const PlayListControls = ({ playlist }: { playlist: Playlist }) => {
  const SongView = (song: SongWithVotes) => {
    return (
      <>
        <SongItemRow song={song} />
      </>
    );
  };

  return (
    <div>
      <header>Playlist</header>
      <SongsPanel role={"list"} aria-label={"song-panel"}>
        <div>Song</div>
        <div>Requested by</div>
        <div>Votes</div>
        <div></div>
        {playlist.songs.page.map((song, i) => SongView(song))}
      </SongsPanel>
    </div>
  );
};
export const AdminPage = ({ getPlaylist }: { getPlaylist: GetPlaylist }) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  // TODO: refactor this loading pattern out. It's always the same
  useEffect(() => {
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
    <PlayListControls playlist={playlist} />
  ) : (
    <LoadingMessagePanel />
  );
  return <div>{panel}</div>;
};
