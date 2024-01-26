import type { Meta, StoryObj } from "@storybook/react";
import { SongPage } from "../pages/song";
import { SongWithVotes } from "../domain/song";
import { User } from "../domain/users";
import { NavigateFunction } from "react-router/dist/lib/hooks";
import type { To } from "@remix-run/router";
import type { NavigateOptions } from "react-router/dist/lib/context";

const meta = {
  title: "Song Page",
  component: SongPage,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  argTypes: {},
} satisfies Meta<typeof SongPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const nav: NavigateFunction = (to: To | number, options?: NavigateOptions) => {
  // NO OP
};

const baseConfiguration = {
  getSong: async (): Promise<SongWithVotes | undefined> => {
    return {
      id: "12345",
      title: "Yer Song",
      artistName: "The Somerfields",
      voteCount: 0,
      lockOrder: 0,
      voters: [],
    };
  },
  voteForSong: async () => {
    //NO OP
  },

  currentUser: (): User | undefined => {
    return {
      id: "user1",
      name: "User 1",
    };
  },

  songId: "12345",

  submitDollarVoteForSong: async () => {
    console.log("submitDollarVoteForSongFn");
    return {
      requestId: "",
    };
  },
};

export const OneVotePerPersonPerSongModeDefault: Story = {
  args: { ...baseConfiguration, voteMode: "SINGLE_VOTE" },
};

export const VotingWithDollarsMode: Story = {
  args: { ...baseConfiguration, voteMode: "DOLLAR_VOTE" },
};
