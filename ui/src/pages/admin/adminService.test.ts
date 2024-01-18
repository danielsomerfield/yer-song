import { createAdminService } from "./adminService";
import { Configuration } from "../../configuration";
import { Axios, AxiosResponse } from "axios";
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("the admin service", () => {
  it("posts user login", async () => {
    const username = "admin1";
    const password = "password1";
    const adminToken = "adminToken1";
    const configuration: Configuration = {
      songsAPIHostURL: "https://example.com",
    };
    const post: MockedFn<Axios["post"]> = fn();
    const axios = {
      post,
    } as unknown as Axios;
    const saveToken: MockedFn<(token: string) => void> = fn();

    const axiosResponse = {
      status: 200,
      data: {
        data: {
          user: {
            name: username,
            roles: ["administrator"],
          },
          token: adminToken,
        },
      },
    } as unknown as AxiosResponse;
    post.mockResolvedValue(axiosResponse);

    const adminService = createAdminService(configuration, axios, saveToken);
    const response = await adminService.login(username, password);
    expect(response).toEqual("SUCCESS");
    expect(post).toBeCalledWith(
      "https://example.com/admin/login",
      expect.objectContaining({
        username,
        password,
      }),
      expect.anything(),
    );

    expect(saveToken).toHaveBeenCalledWith(adminToken);
  });
});
