import { Song } from "../song";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingPanel } from "../../components/loadingPanel";
import { ListItem } from "../../components/lists";
import { SongControlPanel } from "../../components/songControlPanel";

type GetSongsForTagId = (id: string) => Promise<Song[]>;

const SongListPanel = (songs: Song[]) => {
  return (
    <div>
      {songs.map((s) => {
        return (
          <ListItem
            role={"listitem"}
            key={`song::${s.id}`}
            aria-label={`song: ${s.title}`}
            data-id={s.id}
          >
            {s.title}
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

  let panel;
  if (songs) {
    panel = SongListPanel(songs);
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
