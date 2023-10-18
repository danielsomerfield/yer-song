import { SongPage, SongView } from "./index";
import { cleanup, render, screen } from "@testing-library/react";

describe("the song page", () => {
  beforeEach(() => {
    cleanup();
  });
  describe("the song view", () => {
    it("renders a song", () => {
      const song = { id: "song1", title: "Song 1", artistName: "The Artist" };
      render(<SongView song={song} />);
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
        });
      };
      render(<SongPage getSong={fakeFetch} songId={"song1"} />);

      await screen.findByRole("heading", { name: "song-title" });
      expect(
        screen.getByRole("heading", { name: "song-title" }),
      ).toHaveTextContent("Title 1");
    });
  });
});