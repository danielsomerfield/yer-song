import React, { PropsWithChildren, useEffect, useState } from "react";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { SongWithVotes } from "../../domain/song";
import styled from "styled-components";
import { AdminService } from "./adminService";
import { LoginDialog } from "./loginDialog";
import { User } from "../../domain/users";

const SongAdminButton = styled.button`
  margin: 1vh;
  font-size: 4vh;
  min-width: 8vh;
`;

const PlayListControls = ({
  playlist,
  adminService,
  refresh,
}: {
  playlist: Playlist;
  adminService: AdminService;
  refresh: () => Promise<void>;
}) => {
  const   SongItemRow = ({
    song,
  }: PropsWithChildren & { song: SongWithVotes }) => {
    const songIndex = playlist.songs.page.findIndex((s) => s.id == song.id);
    const isBottom = songIndex >= playlist.songs.page.length - 1;
    const isTop = songIndex <= 0;

    const lockIcon = (song.lockOrder === 1) ? <>&#128274;</> : <>&#128275;</>;
    const SongItemControls = ({ song }: { song: SongWithVotes }) => {
      return (
        <div className="button-div">
          <SongAdminButton
            key={`button-remove-${song.id}`}
            onClick={async (evt) => {
              evt.currentTarget.disabled = true;
              await adminService.removeFromPlaylist(song.id);
              await refresh();
            }}
          >
            [ x ]
          </SongAdminButton>
          <SongAdminButton
            key={`button-up-${song.id}`}
            disabled={isTop}
            onClick={async (evt) => {
              evt.currentTarget.disabled = true;
              await adminService.moveUpOnPlaylist(song.id);
              await refresh();
            }}
          >
            &uarr;
          </SongAdminButton>
          <SongAdminButton
            key={`button-down-${song.id}`}
            disabled={song.voteCount <= 1 || isBottom}
            onClick={async (evt) => {
              evt.currentTarget.disabled = true;
              await adminService.moveDownOnPlaylist(song.id);
              await refresh();
            }}
          >
            &darr;
          </SongAdminButton>
          <SongAdminButton
            key={`button-lock-${song.id}`}
            disabled={song.lockOrder === 1}
            onClick={async (evt) => {
              evt.currentTarget.disabled = true;
              await adminService.lockSong(song.id);
              await refresh();
            }}
          >
            {lockIcon}
          </SongAdminButton>
        </div>
      );
    };
    return (
      //   TODO: the grid is messed up here again. Need to look at why.
      <>
        <tr aria-label={"song-item-row"} role={"row"} >
          <td>{song.title}</td>
          <td>
            {song.voters.length > 0 ? song.voters[0].name : "unknown"}
          </td>
          <td>{song.voteCount}</td>
          <td><SongItemControls song={song} /></td>
        </tr>
      </>
    );
  };

  const SongView = (song: SongWithVotes) => {
    return <SongItemRow song={song} key={`song-item-row-${song.id}`}/>;
  };

  return (
    <div
      aria-label={"play-list-controls"}
      role={"table"}
      style={{
        position: "absolute",
        overflow: "hidden",
        height: "95%",
        width: "90%",
        margin: "1vh",
      }}
    >
      <table>
        <thead>
          <tr aria-label={"songs-title-panel"}>
            <th>Song</th>
            <th>Requested by</th>
            <th>Votes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {playlist.songs.page.map((song) => SongView(song))}
        </tbody>
      </table>
    </div>
  );
};
export const AdminPage = ({
  getPlaylist,
  adminService,
  getCurrentUser,
}: {
  getPlaylist: GetPlaylist;
  adminService: AdminService;
  getCurrentUser: () => User | undefined;
}) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  const refresh = async () => {
    const playlist = await getPlaylist();
    // TODO: check if there is an error
    setPlaylist(playlist.value);
  };
  const startRefresh = () => {
    setInterval(async () => {
      await refresh();
    }, 1000 * 5);
  };

  const isAdmin = (user: User | undefined) => {
    return user?.roles?.find((r) => r == "administrator");
  };

  // TODO: refactor this loading pattern out. It's always the same
  useEffect(() => {
    if (isAdmin(getCurrentUser())) {
      if (!playlist) {
        if (!loadStarted) {
          setLoadStarted(true);
          (async () => {
            await refresh();

            startRefresh();
          })();
        }
      }
    }
  }, undefined);

  if (!isAdmin(getCurrentUser())) {
    return (
      <LoginDialog
        onSubmit={adminService.login}
        onLogin={async (result) => {
          if (result == "SUCCESS") {
            await refresh();
            startRefresh();
          }
        }}
      />
    );
  } else if (playlist) {
    return (
      <PlayListControls
        playlist={playlist}
        adminService={adminService}
        refresh={refresh}
      />
    );
  } else {
    return <LoadingMessagePanel />;
  }
};
