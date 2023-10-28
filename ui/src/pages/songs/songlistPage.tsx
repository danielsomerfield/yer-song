import { Song } from "../song";
import { MouseEventHandler, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { ListItem } from "../../components/lists";
import { NavPanel } from "../../components/navPanel";

type GetSongsForTagId = (id: string) => Promise<Song[]>;

const SongListPanel = (songs: Song[], navigator: NavigateFunction) => {
  // TODO: add test for navigation

  return (
    <div>
      {songs.map((song) => {
        const goToSong: MouseEventHandler = () => {
          navigator(`/songs/${song.id}`);
        };
        return (
          <ListItem
            onClick={goToSong}
            role={"listitem"}
            key={`song::${song.id}`}
            aria-label={`song: ${song.title}`}
            data-id={song.id}
          >
            {song.title}
          </ListItem>
        );
      })}
    </div>
  );
};

export const SongListView = ({
  getSongsForTagId,
  tagId,
  nav,
}: {
  getSongsForTagId: GetSongsForTagId;
  tagId: string;
  nav: NavigateFunction;
}) => {
  const [loadStarted, setLoadStarted] = useState(false);
  const [songs, setSongs] = useState<Song[] | undefined>(undefined);

  let panel;
  if (songs) {
    panel = SongListPanel(songs, nav);
  } else if (!loadStarted) {
    setLoadStarted(true);
    (async () => {
      const songsForTag = await getSongsForTagId(tagId);
      setSongs(songsForTag);
    })();
    panel = <LoadingMessagePanel />;
  } else {
    panel = <LoadingMessagePanel />;
  }
  // TODO (MVP): handle load failure case
  return panel;
};

export const SongListPage = ({
  getSongsForTagId,
  nav,
}: {
  getSongsForTagId: GetSongsForTagId;
  nav: NavigateFunction;
}) => {
  const { tag } = useParams();
  console.log("The tag", tag);
  if (!tag) {
    // TODO (MVP): what do we do here?
    throw "NYI: no tag";
  }

  return (
    <>
      <SongListView getSongsForTagId={getSongsForTagId} tagId={tag} nav={nav} />

      <NavPanel />
    </>
  );
};
