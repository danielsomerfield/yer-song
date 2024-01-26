import type { Meta, StoryObj } from "@storybook/react";
import { SongPage } from "../pages/song";
import { SongWithVotes } from "../domain/song";
import { User } from "../domain/users";
import { NavigateFunction } from "react-router/dist/lib/hooks";
import type { To } from "@remix-run/router";
import type { NavigateOptions } from "react-router/dist/lib/context";
import { PlayListPage } from "../pages/playlist/playlist";
import { GetPlaylist } from "../domain/playlist";
import { StatusCodes } from "../services/common";

const meta = {
  title: "Playlist Page",
  component: PlayListPage,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  argTypes: {},
} satisfies Meta<typeof PlayListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const nav: NavigateFunction = (to: To | number, options?: NavigateOptions) => {
  // NO OP
};

const getPlaylist: GetPlaylist = async () => {
  return {
    status: StatusCodes.OK,
    value: {
      songs: {
        page: [
          {
            id: "s:123",
            title: "Song 123",
            artistName: "The artist",
            lockOrder: 0,
            voters: [
              {
                id: "1",
                name: "Bob",
              },
            ],
            voteCount: 1,
          },
          {
            id: "s:234",
            title: "Song 245",
            artistName: "The other artist",
            lockOrder: 1,
            voters: [
              {
                id: "1",
                name: "Bob",
              },
            ],
            voteCount: 1,
          },
        ],
      },
    },
  };
};
const baseConfiguration = {
  nav,
  getPlaylist: getPlaylist,
  voteForSong: () => {
    throw "NYI";
  },
  registerUser: () => {
    throw "NYI";
  },
};

export const OneVotePerPersonPerSongModeDefault: Story = {
  args: {
    ...baseConfiguration,
    voteMode: "SINGLE_VOTE",
  },
};

export const VotingWithDollarsMode: Story = {
  args: {
    ...baseConfiguration,
    voteMode: "DOLLAR_VOTE",
  },
};
