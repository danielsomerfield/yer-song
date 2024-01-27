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
import { User } from "../../domain/users";

describe("the song page", () => {
  const currentUser: MockedFunction<CurrentUser> = fn();

  beforeEach(() => {
    cleanup();
  });

  const song = {
    id: "song1",
    title: "Song 1",
    artistName: "The Artist",
    lockOrder: 0,
  };

  const songWithVotes = {
    ...song,
    voteCount: 1,
    voters: [
      {
        id: "different user",
        name: "Different User",
      },
    ],
  };

  describe("the song view", () => {
    it("renders a song", () => {
      render(
        <SongView
          song={songWithVotes}
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

    it("renders the request button in vote mode with no votes", () => {
      const noVoteSong = { ...song, voteCount: 0, voters: [] };
      render(
        <SongView
          song={noVoteSong}
          voteForSong={async () => {
            throw "Not expected";
          }}
          currentUser={currentUser}
          voteMode={"SINGLE_VOTE"}
        />,
      );
      expect(screen.getByRole("button", { name: "vote-button" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "vote-button" }),
      ).toHaveTextContent("Request");
    });

    it("renders the up vote button if there are votes but user didn't vote for it already", () => {
      render(
        <SongView
          song={songWithVotes}
          voteForSong={async () => {
            throw "Not expected";
          }}
          currentUser={currentUser}
          voteMode={"SINGLE_VOTE"}
        />,
      );
      expect(screen.getByRole("button", { name: "vote-button" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "vote-button" }),
      ).toHaveTextContent("Up vote");
      expect(screen.getByRole("button", { name: "vote-button" })).toBeEnabled();
    });

    it("disable button if user already voted for it", () => {
      const user: User = {
        id: "user123",
        name: "User 123",
      };

      const songFromThisUser = {
        id: "123",
        title: "Song from me",
        artistName: "Whoever",
        voteCount: 1,
        lockOrder: 0,
        voters: [user],
      };
      render(
        <SongView
          song={songFromThisUser}
          voteForSong={async () => {
            throw "Not expected";
          }}
          currentUser={() => user}
          voteMode={"SINGLE_VOTE"}
        />,
      );
      expect(screen.getByRole("button", { name: "vote-button" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "vote-button" }),
      ).toBeDisabled();
    });

    it("renders the venmo request button in dollar vote mode", () => {
      render(
        <SongView
          song={songWithVotes}
          voteForSong={async () => {
            throw "Not expected";
          }}
          currentUser={currentUser}
          voteMode={"DOLLAR_VOTE"}
        />,
      );
      expect(screen.getByRole("button", { name: "Venmo" })).toBeVisible();
    });

    it("disables the venmo request button with negative values", () => {
      render(
        <SongView
          song={songWithVotes}
          voteForSong={async () => {
            throw "Not expected";
          }}
          currentUser={currentUser}
          voteMode={"DOLLAR_VOTE"}
        />,
      );
      fireEvent.change(screen.getByRole("button", { name: "Venmo" }), "-5");
      waitFor(() => {
        expect(screen.getByRole("button", { name: "Venmo" })).toBeDisabled();
      });
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
