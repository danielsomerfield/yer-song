import { rest } from "msw";
import { setupServer } from "msw/node";
import { Song } from "./index";
import { createSongForIdFn } from "./songService";

describe("the song service", () => {
  const serviceURL = "http://host:1234";
  const songFromAPI: Song = {
    id: "song1",
    title: "Yer Song",
    artistName: "Elton Bob",
  };
  const server = setupServer(
    rest.get(`${serviceURL}/songs/${songFromAPI.id}`, (req, res, ctx) => {
      return res(ctx.json({ data: songFromAPI }));
    }),
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("fetches an existing song by id ", async () => {
    const getSongById = createSongForIdFn({
      songsAPIHostURL: serviceURL,
    });
    const returnedSong = await getSongById(songFromAPI.id);
    expect(returnedSong).toMatchObject(songFromAPI);
  });
});
