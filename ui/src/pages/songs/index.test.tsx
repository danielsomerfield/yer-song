import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Tags } from "./tagsService";
import { NavigateFunction } from "react-router-dom";
import { GenreSelectorPage } from "./genreSelectorPage";
import fn = jest.fn;
import Mock = jest.Mock;
import { ok } from "../../services/common";

describe("the genres page", () => {
  const genres: Tags = {
    page: [
      { name: "genre", value: "Punk", id: "g:P" },
      { name: "genre", value: "Triphop", id: "g:T" },
    ],
  };

  beforeEach(() => {
    cleanup();
  });

  const tagQuery = () => Promise.resolve(ok(genres));

  it("loads all genres", async () => {
    render(
      <GenreSelectorPage getGenres={tagQuery} nav={fn()} registerUser={fn()} />,
    );

    await act(() => tagQuery());

    const genresItems = screen.getAllByRole("listitem");
    expect(genresItems.length).toEqual(2);
    expect(
      genresItems.map((i) => i.attributes.getNamedItem("data-tag-name")?.value),
    ).toEqual(["genre", "genre"]);

    expect(
      genresItems.map(
        (i) => i.attributes.getNamedItem("data-tag-value")?.value,
      ),
    ).toEqual(["Punk", "Triphop"]);
  });
  it("redirects to the URL for the tags of the given genre", async () => {
    const navmock: Mock<NavigateFunction> = fn();

    render(
      <GenreSelectorPage
        getGenres={tagQuery}
        nav={navmock}
        registerUser={fn()}
      />,
    );
    await act(() => tagQuery());
    fireEvent.click(screen.getByRole("listitem", { name: "tag::genre=Punk" }));

    await waitFor(() => {
      expect(navmock.mock.calls.length).toEqual(1);
      expect(navmock.mock.calls[0][0]).toEqual("/tags/g:P/songs");
    });
  });
});
