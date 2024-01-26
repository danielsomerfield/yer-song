import type { Meta, StoryObj } from "@storybook/react";
import { LoginDialog } from "../pages/admin/loginDialog";
import { DollarVoteAdminPage } from "../pages/admin/dollarVoteAdminPage";
import { AdminService } from "../pages/admin/adminService";
import { SongRequest } from "../domain/voting";
import { User } from "../domain/users";
import { requests } from "../pages/admin/mockData";

const meta = {
  title: "Admin: Dollar Voting",
  component: DollarVoteAdminPage,
  parameters: {
    layout: "centered",
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
} satisfies Meta<typeof DollarVoteAdminPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HasSomeVoteRequests: Story = {
  args: {
    getSongRequests: async () => {
      return {
        status: "OK",
        value: {
          page: [
            requests.request1,
            requests.request2,
            requests.approvedRequest3,
          ],
        },
      };
    },
    adminService: {} as AdminService,
  },
};
