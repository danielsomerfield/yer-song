export const SongIds = {
  song1Id: `s:song1`,
  song2Id: `s:song2`,
  song3Id: `s:song3`,
};

export const GenreIds = {
  genre1: "t:genre:Goofball",
  genre2: "t:genre:Non-movies",
};
export const Songs = {
  song1: {
    TableName: "song",
    Item: {
      PK: {
        S: SongIds.song1Id,
      },
      SK: {
        S: SongIds.song1Id,
      },
      title: {
        S: "Someone I used to know",
      },
      artistName: {
        S: "Gatchya",
      },
      GSI1PK: {
        S: GenreIds.genre1,
      },
    },
  },

  song2: {
    TableName: "song",
    Item: {
      PK: {
        S: SongIds.song3Id,
      },
      SK: {
        S: SongIds.song3Id,
      },
      title: {
        S: "I Love Saskatoon",
      },
      artistName: {
        S: "Randy No Man",
      },
      GSI1PK: {
        S: GenreIds.genre1,
      },
    },
  },
  song3: {
    TableName: "song",
    Item: {
      PK: {
        S: SongIds.song3Id,
      },
      SK: {
        S: SongIds.song3Id,
      },
      title: {
        S: "I Love Saskatoon",
      },
      artistName: {
        S: "Randy No Man",
      },
      GSI1PK: {
        S: GenreIds.genre1,
      },
    },
  },
};
