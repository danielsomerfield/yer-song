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

const SongItemRow = ({
  song,
  playlist,
  adminService,
  refresh,
}: PropsWithChildren & {
  song: SongWithVotes;
  playlist: Playlist;
  adminService: AdminService;
  refresh: () => Promise<void>;
}) => {
  const songIndex = playlist.songs.page.findIndex((s) => s.id == song.id);
  const upArrowDisabled = songIndex <= 0 || song.lockOrder == 0;

  const lockIcon = song.lockOrder > 0 ? <>&#128274;</> : <>&#128275;</>;
  const lockButtonStyle = song.lockOrder > 0 ? "red" : "transparent";
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
          X
        </SongAdminButton>
        <SongAdminButton
          key={`button-up-${song.id}`}
          disabled={upArrowDisabled}
          onClick={async (evt) => {
            evt.currentTarget.disabled = true;
            await adminService.moveUpOnPlaylist(song.id);
            await refresh();
          }}
          title={"Move to the top of the list"}
        >
          &uarr;
        </SongAdminButton>

        <SongAdminButton
          key={`button-lock-${song.id}`}
          style={
            song.lockOrder > 0
              ? { background: "red" }
              : { background: "transparent" }
          }
          title={song.lockOrder > 0 ? "click to unlock me" : "click to lock me"}
          onClick={async (evt) => {
            evt.currentTarget.disabled = true;
            if (song.lockOrder > 0) {
              await adminService.unlockSong(song.id);
            } else {
              await adminService.lockSong(song.id);
            }
            await refresh();
          }}
        >
          {lockIcon}
        </SongAdminButton>
      </div>
    );
  };
  return (
    <>
      <tr aria-label={"song-item-row"} role={"row"}>
        <td>{song.title}</td>
        <td>{song.voters.length > 0 ? song.voters[0].name : "unknown"}</td>
        <td>{song.voteCount}</td>
        <td>
          <SongItemControls song={song} />
        </td>
      </tr>
    </>
  );
};

const PlayListControls = ({
  playlist,
  adminService,
  refresh,
}: {
  playlist: Playlist;
  adminService: AdminService;
  refresh: () => Promise<void>;
}) => {
  const SongView = (song: SongWithVotes) => {
    return (
      <SongItemRow
        song={song}
        key={`song-item-row-${song.id}`}
        adminService={adminService}
        refresh={refresh}
        playlist={playlist}
      />
    );
  };

  return (
    <div
      aria-label={"play-list-controls"}
      role={"table"}
      style={{
        fontSize: "3vh",
        position: "absolute",
        overflowX: "scroll",
        width: "95%",
        margin: "1vh",
        display: "flex",
        justifyItems: "center",
      }}
    >
      <table>
        <thead>
          <tr aria-label={"songs-title-panel"}>
            <th>Song</th>
            <th>Requester</th>
            <th>Votes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{playlist.songs.page.map((song) => SongView(song))}</tbody>
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
