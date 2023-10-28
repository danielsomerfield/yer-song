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
        S: "Song 1",
      },
      artistName: {
        S: "Artist 1",
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
        S: SongIds.song2Id,
      },
      SK: {
        S: SongIds.song2Id,
      },
      title: {
        S: "Song 2",
      },
      artistName: {
        S: "Artist 2",
      },
      voteCount: {
        N: "1",
      },
      GSI1PK: {
        S: GenreIds.genre2,
      },
      GSI2PK: {
        S: "ON_PLAYLIST",
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
        S: "Song 3",
      },
      artistName: {
        S: "Artist 3",
      },
      voteCount: {
        N: "4",
      },
      GSI1PK: {
        S: GenreIds.genre1,
      },
      GSI2PK: {
        S: "ON_PLAYLIST",
      },
    },
  },
};
