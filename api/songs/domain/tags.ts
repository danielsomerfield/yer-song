export interface Tag {
  id: string;
  name: string;
  value: string;
}

export interface Tags {
  thisPage: string;
  nextPage: string;
  page: Tag[];
}
