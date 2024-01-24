import { SongPage, SongView } from "./index";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CurrentUser } from "../../services/userService";
import fn = jest.fn;
import MockedFunction = jest.MockedFunction;

describe("the song page", () => {
  const currentUser: MockedFunction<CurrentUser> = fn();

  beforeEach(() => {
    cleanup();
  });
  describe("the song view", () => {
    it("renders a song", () => {
      const song = {
        id: "song1",
        title: "Song 1",
        artistName: "The Artist",
        voteCount: 0,
        lockOrder: 0,
        voters: [],
      };
      render(
        <SongView
          song={song}
          voteForSong={async () => {
            throw "Not expected";
          }}
          currentUser={currentUser}
        />,
      );
      expect(
        screen.getByRole("heading", { name: "song-title" }),
      ).toHaveTextContent("Song 1");
      expect(
        screen.getByRole("heading", { name: "artist-name" }),
      ).toHaveTextContent("The Artist");
    });
  });

  describe("loading from api", () => {
    it("renders the page when load is successful", async () => {
      const fakeFetch = () => {
        return Promise.resolve({
          id: "song1",
          title: "Title 1",
          artistName: "Artist 1",
          voteCount: 0,
          lockOrder: 0,
          voters: [],
        });
      };

      render(
        <SongPage
          getSong={fakeFetch}
          songId={"song1"}
          voteForSong={fn()}
          currentUser={currentUser}
        />,
      );

      await screen.findByRole("heading", { name: "song-title" });
      expect(
        screen.getByRole("heading", { name: "song-title" }),
      ).toHaveTextContent("Title 1");
    });

    it("disables the vote button when the vote is registered", async () => {
      const fakeFetch = () => {
        return Promise.resolve({
          id: "song1",
          title: "Title 1",
          artistName: "Artist 1",
          voteCount: 0,
          lockOrder: 0,
          voters: [],
        });
      };

      render(
        <SongPage
          getSong={fakeFetch}
          songId={"song1"}
          voteForSong={fn()}
          currentUser={currentUser}
        />,
      );

      const button: HTMLButtonElement = await screen.findByRole("button", {
        name: "vote-button",
      });
      fireEvent.click(button);

      await waitFor(async () => {
        expect(button.disabled).toEqual(true);
      });
    });

    // TODO: re-enable button if submit fails
  });

  it("shows the 'first' voter (or requester) when there is one", async () => {
    const fakeFetch = () => {
      return Promise.resolve({
        id: "song1",
        title: "Title 1",
        artistName: "Artist 1",
        voteCount: 1,
        lockOrder: 0,
        voters: [
          {
            id: "user123",
            name: "User 123",
          },
        ],
      });
    };

    render(
      <SongPage
        getSong={fakeFetch}
        songId={"song1"}
        voteForSong={fn()}
        currentUser={currentUser}
      />,
    );

    await screen.findByRole("heading", { name: "song-title" });
    expect(
      screen.getByRole("note", { name: "requested-by" }),
    ).toHaveTextContent("User 123");
  });

  it("disables the vote button if this user has already voted", async () => {
    currentUser.mockReturnValue({
      id: "user123",
      name: "User 123",
    });

    const fakeFetch = () => {
      return Promise.resolve({
        id: "song1",
        title: "Title 1",
        artistName: "Artist 1",
        voteCount: 1,
        lockOrder: 0,
        voters: [
          {
            id: "user123",
            name: "User 123",
          },
        ],
      });
    };

    render(
      <SongPage
        getSong={fakeFetch}
        songId={"song1"}
        voteForSong={fn()}
        currentUser={currentUser}
      />,
    );

    await screen.findByRole("heading", { name: "song-title" });

    const button: HTMLButtonElement = await screen.findByRole("button", {
      name: "vote-button",
    });
    expect(button.disabled).toEqual(true);
  });
});
