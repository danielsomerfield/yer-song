import styled from "styled-components";
import {
  GetSongRequests,
  RequestStatuses,
  SongRequest,
  SongRequests,
} from "../../domain/voting";
import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { LoadStatus, LoadStatuses } from "../common/loading";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { LoginDialog } from "./loginDialog";
import { AdminService } from "./adminService";
import { StatusCodes } from "../../services/common";
import { setBackButtonLocation } from "../../components/navPanel";

export const RequestTable = styled.table`
  border: lightgrey 1px solid;
  max-width: 95%;

  font-size: 2vh;
  table-layout: auto;

  & th {
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    border-left: lightgrey 1px solid;
  }

  & td {
    border: lightgrey 1px solid;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const AdminButton = styled.button`
  font-size: 2vh;
`;

export const VoteRequestRow = ({
  request,
  adminService,
  load,
}: {
  request: SongRequest;
  adminService: AdminService;
  load: () => Promise<void>;
}) => {
  const action =
    request.status == RequestStatuses.PENDING_APPROVAL ? (
      <>
        <td>
          <AdminButton
            onClick={async (evt) => {
              try {
                evt.currentTarget.disabled = true;
                await adminService.approveSongRequest({
                  requestId: request.requestId,
                  songId: request.song.id,
                  value: request.value,
                });
              } catch (e) {
                console.log(e);
                //TODO: show the toast error
              }
              await load();
            }}
          >
            Approve
          </AdminButton>
        </td>
        <td>
          <AdminButton
            onClick={async (evt) => {
              try {
                evt.currentTarget.disabled = true;
                await adminService.denySongRequest({
                  requestId: request.requestId,
                  songId: request.song.id,
                });
              } catch (e) {
                console.log(e);
                //TODO: show the toast error
              }
              await load();
            }}
          >
            Deny
          </AdminButton>
        </td>
      </>
    ) : (
      <td colSpan={2}>
        <div>Approved</div>
      </td>
    );
  return (
    <tr aria-label={"dollar-vote-request"}>
      {action}
      <td aria-label={"amount"}>${request.value}</td>
      <td aria-label={"requested-by"}>{request.requestedBy.name}</td>
      <td aria-label={"title"}>{request.song.title}</td>
      <td aria-label={"timestamp"}>{request.timestamp.toISO()}</td>
      <td aria-label={"request-id"}>{request.requestId}</td>
    </tr>
  );
};

const RequestTableContainer = styled.div`
  overflow: scroll;
  max-height: 85%;
  max-width: 100%;
  position: fixed;
`;

export const DollarVoteAdminPage = ({
  getSongRequests,
  adminService,
  refreshTime = 10_000,
}: {
  getSongRequests: GetSongRequests;
  adminService: AdminService;
  refreshTime?: number;
}) => {
  const [loadStatus, setLoadStatus] = useState<LoadStatus<SongRequests>>(
    LoadStatuses.UNINITIALIZED,
  );

  const timer = useRef<number | undefined>(undefined);

  const load = async () => {
    const maybeVoteRequests = await getSongRequests();

    if (maybeVoteRequests.status == StatusCodes.REGISTRATION_REQUIRED) {
      if (timer.current) {
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
      setLoadStatus(LoadStatuses.REGISTRATION_REQUIRED);
    } else if (maybeVoteRequests.status == "OK") {
      setLoadStatus({
        data: maybeVoteRequests.value,
        name: "loaded",
      });
    } else if (
      maybeVoteRequests.status == StatusCodes.INSUFFICIENT_PERMISSIONS
    ) {
      if (timer.current) {
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
      setLoadStatus(LoadStatuses.ADMIN_REQUIRED);
    }
  };

  useEffect(() => {
    setBackButtonLocation("/playlist");

    if (loadStatus.name == LoadStatuses.UNINITIALIZED.name) {
      (async () => {
        setLoadStatus(LoadStatuses.LOADING);
        await load();
      })();
    } else if (loadStatus.name == "loaded" && timer.current == undefined) {
      timer.current = window.setInterval(async () => {
        await load();
      }, refreshTime);
    }
  }, undefined);

  //TODO: replace this function with a shared component
  const panel = () => {
    if (loadStatus.name == LoadStatuses.LOADING.name) {
      return <LoadingMessagePanel />;
    } else if (
      loadStatus.name == LoadStatuses.REGISTRATION_REQUIRED.name ||
      loadStatus.name == LoadStatuses.ADMIN_REQUIRED.name
    ) {
      return (
        <LoginDialog
          title={"Admin Login"}
          onSubmit={adminService.login}
          onLogin={async (result) => {
            if (result == "SUCCESS") {
              setLoadStatus(LoadStatuses.UNINITIALIZED);
            }
          }}
        />
      );
    } else if (loadStatus.name == "loaded") {
      if (loadStatus.data?.page) {
        if (loadStatus.data.page.length == 0) {
          return <EmptyPanel />;
        } else {
          return (
            <>
              <RequestTableContainer className={"request-table-container"}>
                <RequestTable aria-label={"dollar-vote-request-table"}>
                  <thead role={"columnheader"}>
                    <tr>
                      <th colSpan={2}>Actions</th>
                      <th>Amount</th>
                      <th>Requested by</th>
                      <th>Title</th>
                      <th>Timestamp</th>
                      <th>Request Id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadStatus.data.page.map((sr) => (
                      <VoteRequestRow
                        key={sr.requestId}
                        request={sr}
                        adminService={adminService}
                        load={load}
                      ></VoteRequestRow>
                    ))}
                  </tbody>
                </RequestTable>
              </RequestTableContainer>
            </>
          );
        }
      } else {
        // TODO: can we eliminate this case with type manipulations?
        console.error("This isn't supposed to happen");
        return <EmptyPanel />;
      }
    }
  };

  return <Container>{panel()}</Container>;
};

const Container = styled.div`
  overflow: hidden;
  display: flex;
  justify-content: center;
  height: 100%;
`;

const EmptyPanel = () => {
  return (
    <>
      <div role={"note"} aria-label={"empty-playlist"} className="message">
        Nothing to display
      </div>
    </>
  );
};
