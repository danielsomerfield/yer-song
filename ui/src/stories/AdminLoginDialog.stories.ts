import type { Meta, StoryObj } from "@storybook/react";
import { LoginDialog } from "../pages/admin/loginDialog";

const meta = {
  title: "Admin Login Dialog",
  component: LoginDialog,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
} satisfies Meta<typeof LoginDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginSuccess: Story = {
  args: {
    onLogin: () => Promise.resolve("SUCCESS"),
  },
};

export const LoginFailed: Story = {
  args: {
    onLogin: () => Promise.resolve("FAILURE"),
  },
};

export const loginError: Story = {
  args: {
    onLogin: () => Promise.reject(),
  },
};
