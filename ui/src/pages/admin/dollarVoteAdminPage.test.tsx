import { describe } from "@jest/globals";
import { queryAllByRole, render, screen } from "@testing-library/react";
import { DollarVoteAdminPage, VoteRequestRow } from "./dollarVoteAdminPage";
import { GetSongRequests } from "../../domain/voting";
import { AdminService } from "./adminService";
import { requests } from "./mockData";
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("The dollar vote admin page", () => {
  const getSongRequests: MockedFn<GetSongRequests> = fn();
  const adminService: AdminService = {} as AdminService;

  it("displays pending dollar votes for a logged in admin", async () => {
    getSongRequests.mockResolvedValue({
      status: "OK",
      value: {
        page: [requests.request1, requests.request2],
      },
    });
    render(
      <DollarVoteAdminPage
        getSongRequests={getSongRequests}
        adminService={adminService}
      />,
    );

    const table = await screen.findByRole("table", {
      name: "dollar-vote-request-table",
    });

    const rows = queryAllByRole(table, "row", { name: "dollar-vote-request" });

    expect(rows).toBeDefined();
    expect(rows.length).toEqual(2);
  });

  it("shows the approve button for a pending request", () => {
    render(
      <table>
        <tbody>
          <VoteRequestRow
            request={requests.request1}
            adminService={adminService}
          />
        </tbody>
      </table>,
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
  });

  it("it hides the approve button for an approved request", () => {
    render(
      <table>
        <tbody>
          <VoteRequestRow
            request={requests.approvedRequest3}
            adminService={adminService}
          />
        </tbody>
      </table>,
    );
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.queryByRole("cell", { name: "action" })).toHaveTextContent(
      "Approved",
    );
  });

  // TODO: doesn't show data, but prompts admin login if not an admin
});
