import { describe, it } from "@jest/globals";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { PlayListPage } from "./playlist";
import { GetPlaylist } from "../../domain/playlist";
import { error, ok, StatusCodes } from "../../services/common";
import MockedFn = jest.MockedFn;
import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;

describe("the playlist page", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("displays the loading dialog when loading starts", async () => {
    const getPlayList: MockedFn<GetPlaylist> = fn();

    getPlayList.mockResolvedValue(
      ok({
        songs: {
          page: [],
        },
      }),
    );

    render(
      <PlayListPage
        getPlaylist={getPlayList}
        registerUser={fn()}
        nav={fn()}
        voteForSong={fn()}
      />,
    );

    await waitFor(async () => {
      expect(
        await screen.findByRole("note", { name: "loading" }),
      ).toBeVisible();
    });
  });

  it("it shows the playlist on load completion", async () => {
    const getPlayList: MockedFn<GetPlaylist> = fn();
    getPlayList.mockResolvedValue(
      ok({
        songs: {
          page: [
            {
              id: "123",
              title: "the song",
              voters: [],
              artistName: "???",
              voteCount: 0,
            },
          ],
        },
      }),
    );
    render(
      <PlayListPage
        getPlaylist={getPlayList}
        registerUser={fn()}
        nav={fn()}
        voteForSong={fn()}
      />,
    );

    await waitForElementToBeRemoved(
      screen.getByRole("note", { name: "loading" }),
    );

    expect(screen.getByRole("list", { name: "song-list" })).toBeVisible();
  });

  it("it prompts user to add songs if none are there", async () => {
    const getPlayList: MockedFn<GetPlaylist> = fn();
    getPlayList.mockResolvedValue(ok({ songs: { page: [] } }));
    render(
      <PlayListPage
        getPlaylist={getPlayList}
        registerUser={fn()}
        nav={fn()}
        voteForSong={fn()}
      />,
    );

    await waitForElementToBeRemoved(
      screen.getByRole("note", { name: "loading" }),
    );

    expect(screen.getByRole("note", { name: "empty-playlist" })).toBeVisible();
  });

  it("it shows the user registration form on a 401", async () => {
    const getPlayList: MockedFn<GetPlaylist> = fn();
    getPlayList.mockRejectedValue({});
    getPlayList.mockResolvedValue(error(StatusCodes.REGISTRATION_REQUIRED));
    render(
      <PlayListPage
        getPlaylist={getPlayList}
        registerUser={fn()}
        nav={fn()}
        voteForSong={fn()}
      />,
    );

    await waitForElementToBeRemoved(
      screen.getByRole("note", { name: "loading" }),
    );

    expect(
      screen.getByRole("dialog", { name: "registration-form" }),
    ).toBeVisible();

    expect(screen.queryByRole("note", { name: "empty-playlist" })).toBeNull();
    expect(screen.queryByRole("list", { name: "song-list" })).toBeNull();
  });
});
