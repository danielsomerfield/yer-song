import React, { PropsWithChildren, useEffect, useState } from "react";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { SongWithVotes } from "../../domain/song";
import styled from "styled-components";
import { AdminService } from "./adminService";

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

const RequestedBy = styled.div`
  margin-left: 1vh;
`;

const PlayListControls = ({
  playlist,
  adminService,
}: {
  playlist: Playlist;
  adminService: AdminService;
}) => {
  const SongItemRow = ({
    song,
  }: PropsWithChildren & { song: SongWithVotes }) => {
    const SongItemControls = ({ song }: { song: SongWithVotes }) => {
      return (
        <div>
          <SongAdminButton
            key={`button-remove-${song.id}`}
            onClick={async () => {
              await adminService.removeFromPlaylist(song.id);
            }}
          >
            Remove
          </SongAdminButton>
          <SongAdminButton
            key={`button-up-${song.id}`}
            onClick={async () => {
              await adminService.moveUpOnPlaylist(song.id);
            }}
          >
            Up
          </SongAdminButton>
          <SongAdminButton
            key={`button-down-${song.id}`}
            onClick={async () => {
              await adminService.moveDownOnPlaylist(song.id);
            }}
          >
            Down
          </SongAdminButton>
        </div>
      );
    };
    return (
      <>
        <SongPanel>{song.title}</SongPanel>
        <RequestedBy>
          {song.voters.length > 0 ? song.voters[0].name : "unknown"}
        </RequestedBy>
        <div>{song.voteCount}</div>
        <SongItemControls song={song} />
      </>
    );
  };

  const SongView = (song: SongWithVotes) => {
    return <SongItemRow song={song} key={`song-item-row-${song.id}`} />;
  };

  return (
    <div>
      <header>Playlist</header>
      <SongsPanel aria-label={"song-panel"}>
        <div>Song</div>
        <div>Requested by</div>
        <div>Votes</div>
        <div></div>
        {playlist.songs.page.map((song) => SongView(song))}
      </SongsPanel>
    </div>
  );
};
export const AdminPage = ({
  getPlaylist,
  adminService,
}: {
  getPlaylist: GetPlaylist;
  adminService: AdminService;
}) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  const startRefresh = () => {
    setInterval(async () => {
      const playlist = await getPlaylist();
      setPlaylist(playlist);
    }, 1000 * 5);
  };

  // TODO: refactor this loading pattern out. It's always the same
  useEffect(() => {
    if (!playlist) {
      if (!loadStarted) {
        setLoadStarted(true);
        (async () => {
          const playlist = await getPlaylist();
          setPlaylist(playlist);

          startRefresh();
        })();
      }
    }
  }, undefined);
  const panel = playlist ? (
    <PlayListControls playlist={playlist} adminService={adminService} />
  ) : (
    <LoadingMessagePanel />
  );
  return <div>{panel}</div>;
};
