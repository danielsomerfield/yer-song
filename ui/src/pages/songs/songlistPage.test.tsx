import { cleanup, render, screen } from "@testing-library/react";
import { SongListView } from "./songlistPage";
import { Songs } from "../../domain/song";
import fn = jest.fn;
import { ok, ReturnOrError } from "../../services/common";

describe("the song list page", () => {
  beforeEach(() => {
    cleanup();
  });

  it("shows all songs for the tag", async () => {
    const getSongs = (tagId: string): Promise<ReturnOrError<Songs>> => {
      return tagId == "tag3212"
        ? Promise.resolve(
            ok({
              page: [
                {
                  id: "123",
                  title: "Pleasant Valley Tuesday",
                  artistName: "The Monkeyz",
                  voteCount: 0,
                  lockOrder: 0,
                },
                {
                  id: "345",
                  title: "Miserable Hill Wednesday",
                  artistName: "The Donkeys",
                  voteCount: 0,
                  lockOrder: 0,
                },
              ],
            }),
          )
        : Promise.resolve(ok({ page: [] }));
    };
    render(
      <SongListView
        getSongsForTagId={getSongs}
        tagId={"tag3212"}
        nav={() => fn()}
        registerUser={async (user) => {
          throw "NYI";
        }}
      />,
    );
    const songItems = await screen.findAllByRole("listitem");

    expect(songItems.length).toEqual(2);
    expect(
      songItems.map((i) => i.attributes.getNamedItem("aria-label")?.value),
    ).toEqual([
      "song: Miserable Hill Wednesday",
      "song: Pleasant Valley Tuesday",
    ]);
    expect(
      songItems.map((i) => i.attributes.getNamedItem("data-id")?.value),
    ).toEqual(["345", "123"]);

    expect(songItems.map((i) => i.textContent)).toEqual([
      "Miserable Hill Wednesday",
      "Pleasant Valley Tuesday",
    ]);
  });
});
