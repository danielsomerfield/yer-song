import { act, render, screen, waitFor } from "@testing-library/react";
import { AdminPage } from "./adminPage";
import { GetPlaylist } from "../../domain/playlist";
import { AdminService } from "./adminService";
import { User } from "../../domain/users";
import fn = jest.fn;
import MockedFn = jest.MockedFn;
import resetAllMocks = jest.resetAllMocks;
import { CurrentUser } from "../../services/userService";
import MockedFunction = jest.MockedFunction;

describe("the admin page", () => {
  const getPlayList: MockedFn<GetPlaylist> = fn();
  const adminService: AdminService = {} as unknown as AdminService;
  const currentUser: MockedFunction<CurrentUser> = fn();

  const regularUser: User = {
    id: "user1",
    name: "User 1",
  };

  const adminUser: User = {
    id: "user2",
    name: "User 2",
    roles: ["administrator"],
  };

  beforeEach(() => {
    resetAllMocks();
  });

  it("loads the admin login page if the user has no identity", async () => {
    act(() => {
      currentUser.mockReturnValue(undefined);
    });
    render(
      <AdminPage
        getPlaylist={getPlayList}
        adminService={adminService}
        getCurrentUser={currentUser}
      />,
    );

    expect(getPlayList).not.toBeCalled();
    const actual = await screen.findByRole("dialog", { name: "admin-login" });
    expect(actual).toBeVisible();
  });

  it("loads the admin login page if the user has an identity but is not an admin", async () => {
    act(() => {
      currentUser.mockReturnValue(regularUser);
    });
    render(
      <AdminPage
        getPlaylist={getPlayList}
        adminService={adminService}
        getCurrentUser={currentUser}
      />,
    );

    expect(getPlayList).not.toBeCalled();
    const actual = await screen.findByRole("dialog", { name: "admin-login" });
    expect(actual).toBeVisible();
  });

  it("renders the playlist controls rather than the login dialog if the user has an admin identity", async () => {
    getPlayList.mockResolvedValue({
      songs: {
        page: [],
      },
    });
    currentUser.mockReturnValue(adminUser);

    render(
      <AdminPage
        getPlaylist={getPlayList}
        adminService={adminService}
        getCurrentUser={currentUser}
      />,
    );

    const controls = await screen.findByRole("table", {
      name: "play-list-controls",
    });
    expect(controls).toBeVisible();
    expect(screen.queryByRole("dialog", { name: "admin-login" })).toBeNull();
  });
});
