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
  overflow-y: scroll;
  margin-top: 2vh;
`;

const SongsTitlePanel = styled.div`
  display: grid;
  justify-content: left;
  grid-column-gap: 3vh;
  grid-template-columns: 1fr 1fr auto auto;
  text-align: left;
  margin-top: 2dvh;
  text-decoration: underline;
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
    const songIndex = playlist.songs.page.findIndex((s) => s.id == song.id);
    const isBottom = songIndex >= playlist.songs.page.length - 1;
    const isTop = songIndex <= 0;
    const SongItemControls = ({ song }: { song: SongWithVotes }) => {
      return (
        <div>
          <SongAdminButton
            key={`button-remove-${song.id}`}
            onClick={async () => {
              await adminService.removeFromPlaylist(song.id);
            }}
          >
            [ x ]
          </SongAdminButton>
          <SongAdminButton
            key={`button-up-${song.id}`}
            disabled={isTop}
            onClick={async () => {
              await adminService.moveUpOnPlaylist(song.id);
            }}
          >
            &uarr;
          </SongAdminButton>
          <SongAdminButton
            key={`button-down-${song.id}`}
            disabled={song.voteCount <= 1 || isBottom}
            onClick={async () => {
              await adminService.moveDownOnPlaylist(song.id);
            }}
          >
            &darr;
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
      <SongsTitlePanel>
        <div>Song</div>
        <div>Requested by</div>
        <div>Votes</div>
        <div></div>
      </SongsTitlePanel>
      <SongsPanel aria-label={"songs-panel"}>
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
