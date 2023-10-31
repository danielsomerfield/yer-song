import { cleanup, render, screen } from "@testing-library/react";
import { SongListView } from "./songlistPage";
import { Song, Songs } from "../song";
import fn = jest.fn;

describe("the song list page", () => {
  beforeEach(() => {
    cleanup();
  });

  it("shows all songs for the tag", async () => {
    const getSongs = (tagId: string): Promise<Songs> => {
      return tagId == "tag3212"
        ? Promise.resolve({
            page: [
              {
                id: "123",
                title: "Pleasant Valley Tuesday",
                artistName: "The Monkeyz",
                voteCount: 0,
              },
              {
                id: "345",
                title: "Miserable Hill Wednesday",
                artistName: "The Donkeys",
                voteCount: 0,
              },
            ],
          })
        : Promise.resolve({ page: [] });
    };
    render(
      <SongListView
        getSongsForTagId={getSongs}
        tagId={"tag3212"}
        nav={() => fn()}
      />,
    );
    const songItems = await screen.findAllByRole("listitem");

    expect(songItems.length).toEqual(2);
    expect(
      songItems.map((i) => i.attributes.getNamedItem("aria-label")?.value),
    ).toEqual([
      "song: Pleasant Valley Tuesday",
      "song: Miserable Hill Wednesday",
    ]);
    expect(
      songItems.map((i) => i.attributes.getNamedItem("data-id")?.value),
    ).toEqual(["123", "345"]);

    expect(songItems.map((i) => i.textContent)).toEqual([
      "Pleasant Valley Tuesday",
      "Miserable Hill Wednesday",
    ]);
  });
});
