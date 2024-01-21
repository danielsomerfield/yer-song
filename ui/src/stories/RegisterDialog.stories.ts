import type { Meta, StoryObj } from "@storybook/react";

import { RegistrationForm } from "../components/registrationForm";

const meta = {
  title: "Register Dialog",
  component: RegistrationForm,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
} satisfies Meta<typeof RegistrationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Registered: Story = {
  args: {
    onLogin: () => {
      console.log("Login");
    },

    registerUser: () => {
      return Promise.resolve({
        user: {
          name: "user 1",
        },
        token: "",
      });
    },
  },
};

export const NotRegistered: Story = {
  args: {
    onLogin: () => {
      console.log("Login");
    },
    registerUser: () => {
      return Promise.resolve({
        user: {
          name: "user 1",
        },
        token: "",
      });
    },
  },
};
