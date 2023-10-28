import { Song } from "../song";
import { MouseEventHandler, useState } from "react";
import {
  Navigate,
  NavigateFunction,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LoadingPanel } from "../../components/loadingPanel";
import { ListItem } from "../../components/lists";
import { SongControlPanel } from "../../components/songControlPanel";

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
}: {
  getSongsForTagId: GetSongsForTagId;
  tagId: string;
}) => {
  const [loadStarted, setLoadStarted] = useState(false);
  const [songs, setSongs] = useState<Song[] | undefined>(undefined);
  const navigator = useNavigate();

  let panel;
  if (songs) {
    panel = SongListPanel(songs, navigator);
  } else if (!loadStarted) {
    setLoadStarted(true);
    (async () => {
      const songsForTag = await getSongsForTagId(tagId);
      setSongs(songsForTag);
    })();
    panel = <LoadingPanel />;
  } else {
    panel = <LoadingPanel />;
  }
  // TODO: handle load failure case
  return panel;
};

export const SongListPage = ({
  getSongsForTagId,
}: {
  getSongsForTagId: GetSongsForTagId;
}) => {
  const { tag } = useParams();
  console.log("The tag", tag);
  if (!tag) {
    // TODO: what do we do here?
    throw "NYI: no tag";
  }

  return (
    <>
      <SongListView getSongsForTagId={getSongsForTagId} tagId={tag} />
      <SongControlPanel />
    </>
  );
};
