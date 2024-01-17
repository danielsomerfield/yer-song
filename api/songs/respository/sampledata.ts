export const Users = {
  user1: {
    M: {
      id: {
        S: "u:user1",
      },
      name: {
        S: "user 1",
      },
    },
  },
  user2: {
    M: {
      id: {
        S: "u:user2",
      },
      name: {
        S: "user 2",
      },
    },
  },
  user3: {
    M: {
      id: {
        S: "u:user3",
      },
      name: {
        S: "user 3",
      },
    },
  },
  user4: {
    M: {
      id: {
        S: "u:user4",
      },
      name: {
        S: "user 4",
      },
    },
  },
};

export const SongIds = {
  song1Id: `s:song1`,
  song2Id: `s:song2`,
  song3Id: `s:song3`,
  song4Id: 's:song4',
  song5Id: 's:song5',
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
      voters: { L: [Users.user2] },
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
      voters: { L: [Users.user1, Users.user2, Users.user3, Users.user4] },
      GSI1PK: {
        S: GenreIds.genre1,
      },
      GSI2PK: {
        S: "ON_PLAYLIST",
      },
    },
  },

  song4: {
    TableName: "song",
    Item: {
      PK: {
        S: SongIds.song4Id,
      },
      SK: {
        S: SongIds.song4Id,
      },
      title: {
        S: "Song 4",
      },
      artistName: {
        S: "Artist 3",
      },
      voteCount: {
        N: "2",
      },
      lockOrder: {
        N: "2"
      },
      voters: { L: [Users.user1, Users.user2, Users.user3, Users.user4] },
      GSI1PK: {
        S: GenreIds.genre1,
      },
      GSI2PK: {
        S: "ON_PLAYLIST",
      },
    },
  },

  song5: {
    TableName: "song",
    Item: {
      PK: {
        S: SongIds.song5Id,
      },
      SK: {
        S: SongIds.song5Id,
      },
      title: {
        S: "Song 5",
      },
      artistName: {
        S: "Artist 3",
      },
      voteCount: {
        N: "2",
      },
      lockOrder: {
        N: "1"
      },
      voters: { L: [Users.user1, Users.user2, Users.user3, Users.user4] },
      GSI1PK: {
        S: GenreIds.genre1,
      },
      GSI2PK: {
        S: "ON_PLAYLIST",
      },
    },
  },
};
