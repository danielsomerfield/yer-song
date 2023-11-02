import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { setBackButtonLocation } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { GetPlaylist, Playlist } from "../../domain/playlist";

// TODO: this can be combined with the list item in lists.tsx but extract the hover property
const ListItem = styled.div`
  height: 6vh;

  white-space: nowrap;
  overflow: clip;
  text-overflow: ellipsis;
  text-align: left;
  padding: 1vh 0 1vh 0;
  display: flex;
  flex-direction: row;
`;

const SongsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  grid-column-gap: 3vh;
  width: 100%;
  text-align: left;
`;

const SongTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableColumnHeader = styled.div`
  font-weight: bold;
  text-decoration: underline;
`;

const PlaylistView = ({ playlist }: { playlist: Playlist }) => {
  const SongView = (song: SongWithVotes, i: number) => {
    const voterName =
      song.voters && song.voters.length > 0 ? song.voters[0].name : undefined;

    return (
      <ListItem
        role={"listitem"}
        key={`song::${song.id}`}
        aria-label={`song: ${song.title}`}
        data-id={song.id}
      >
        <SongRow>
          <SongTitle>{song.title}</SongTitle>
          <div>{voterName}</div>
          <div>{song.voteCount}</div>
        </SongRow>
      </ListItem>
    );
  };

  return (
    <>
      <SongsPanel role={"list"} aria-label={"tag-list"}>
        <SongRow>
          <TableColumnHeader>Title</TableColumnHeader>
          <TableColumnHeader>Requester</TableColumnHeader>
          <TableColumnHeader>Votes</TableColumnHeader>
        </SongRow>

        {playlist.songs.page.map((tag, i) => SongView(tag, i))}
      </SongsPanel>
    </>
  );
};

export const KioskPlaylist = ({
  getPlaylist,
}: {
  getPlaylist: GetPlaylist;
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
          setInterval(async () => {
            const playlist = await getPlaylist();
            setPlaylist(playlist);
          }, 10 * 1000);
        })();
      }
    }
  }, undefined);

  const panel = playlist ? (
    <PlaylistView playlist={playlist} />
  ) : (
    <LoadingMessagePanel />
  );
  return <>{panel}</>;
};
