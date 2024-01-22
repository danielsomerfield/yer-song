import type { Meta, StoryObj } from "@storybook/react";
import { SubmitDollarVotePanel } from "../pages/song/submitDollarVotePanel";

const meta = {
  title: "Submit dollar vote panel",
  component: SubmitDollarVotePanel,
  parameters: {
    layout: "centered",
  },

  argTypes: {},
} satisfies Meta<typeof SubmitDollarVotePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    onSubmit: () => {
      console.log("onSubmit");
    },
  },
};
