import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { setBackButtonLocation } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { VoteMode, VoteModes } from "../../domain/voting";

// TODO: this can be combined with the list item in lists.tsx but extract the hover property
const ListItem = styled.div`
  height: 6vh;

  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
  padding: 1vh 0 1vh 0;
  display: flex;
  flex-direction: row;
`;

const SongsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 90%;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  grid-column-gap: 3vh;
  width: 100%;
  text-align: center;
  padding: 1vh;
`;

const SongTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableColumnHeader = styled.div`
  font-weight: bold;
  text-decoration: underline;
`;

const SongView = ({
  song,
  voteMode,
}: {
  song: SongWithVotes;
  voteMode: VoteMode;
}) => {
  const voterName =
    song.voters && song.voters.length > 0 ? song.voters[0].name : undefined;

  const totalBidsSymbol = voteMode == VoteModes.SINGLE_VOTE ? "" : "$";
  const lockedForPlay = <div>&#127925;</div>;
  const showingVotes = (
    <div>
      {totalBidsSymbol}
      {song.voteCount}
    </div>
  );
  return (
    <ListItem
      role={"listitem"}
      key={`song::${song.id}`}
      aria-label={`song: ${song.title}`}
      data-id={song.id}
    >
      <SongRow>
        <SongTitle className="left">{song.title}</SongTitle>
        <div>{voterName}</div>
        <div>{song.lockOrder > 0 ? lockedForPlay : showingVotes}</div>
      </SongRow>
    </ListItem>
  );
};

const PlaylistView = ({
  playlist,
  voteMode,
}: {
  playlist: Playlist;
  voteMode: VoteMode;
}) => {
  document.getElementById("qr-code")?.style.setProperty("display", "flow");

  const voteColumnText =
    voteMode == VoteModes.SINGLE_VOTE ? "Votes" : "Total bids";
  return (
    <div className="playlist-kiosk">
      <SongRow>
        <TableColumnHeader className="left">Title</TableColumnHeader>
        <TableColumnHeader>Requester</TableColumnHeader>
        <TableColumnHeader>{voteColumnText}</TableColumnHeader>
      </SongRow>
      <SongsPanel role={"list"} aria-label={"tag-list"}>
        {playlist.songs.page.map((song) => (
          <SongView song={song} voteMode={voteMode} />
        ))}
      </SongsPanel>
    </div>
  );
};

export const KioskPlaylist = ({
  getPlaylist,
  voteMode,
}: {
  getPlaylist: GetPlaylist;
  voteMode: VoteMode;
}) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  async function refresh() {
    try {
      const playlist = await getPlaylist();
      //TODO: check if there is a value
      setPlaylist(playlist.value);
    } catch (e) {
      console.warn("Refresh failed. Will try again");
    }
  }

  // TODO: refactor this loading pattern out. It's always the same
  useEffect(() => {
    setBackButtonLocation("/playlist");
    if (!playlist) {
      if (!loadStarted) {
        setLoadStarted(true);
        (async () => {
          await refresh();
          setInterval(async () => {
            await refresh();
          }, 10 * 1000);
        })();
      }
    }
  }, undefined);

  const panel = () => {
    if (!playlist) {
      return <LoadingMessagePanel />;
    } else if (playlist.songs.page.length == 0) {
      return (
        <div className="message">The playlist is empty. Add some songs!</div>
      );
    } else {
      return <PlaylistView playlist={playlist} voteMode={voteMode} />;
    }
  };
  // TODO: get rid of this hack
  return <>{panel()}</>;
};
