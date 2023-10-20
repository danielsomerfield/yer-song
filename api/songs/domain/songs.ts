export interface Song {
  id: string;
  title: string;
  artistName: string;
}

export interface Songs {
  thisPage: string;
  nextPage: string;
  page: Song[];
}
