import { Song } from "../song";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingPanel } from "../../components/loadingPanel";

type GetSongsForTagId = (id: string) => Song[];

const SongListPanel = (songs: Song[]) => {
  return (
    <div>
      {songs.map((s) => {
        return (
          <div
            role={"listitem"}
            key={`song::${s.id}`}
            aria-label={`song: ${s.title}`}
            data-id={s.id}
          >
            {s.title}
          </div>
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

  if (songs) {
    return SongListPanel(songs);
  } else if (!loadStarted) {
    setSongs(getSongsForTagId(tagId));
    return <LoadingPanel />;
  } else {
    return <LoadingPanel />;
  }
};

export const SongListPage = ({
  getSongsForTag,
}: {
  getSongsForTag: GetSongsForTagId;
}) => {
  const { tag } = useParams();
  console.log("The tag", tag);
  if (!tag) {
    // TODO: what do we do here?
    throw "NYI: no tag";
  }

  return (
    <>
      <SongListView getSongsForTagId={getSongsForTag} tagId={tag} />
    </>
  );
};
