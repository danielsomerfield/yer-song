import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { LoginDialog, LoginResult } from "./loginDialog";
import MockedFn = jest.MockedFn;
import fn = jest.fn;

async function getHiddenAlertsByClass() {
  const hiddenAlerts = await screen.findAllByRole("alert", { hidden: true });
  return hiddenAlerts.flatMap((a) => a.className.split(" "));
}

describe("the login dialog", () => {
  const username = "daniel";
  it("valid username and password enable the login button", async () => {
    const onLogin: MockedFn<
      (username: string, password: string) => Promise<LoginResult>
    > = fn();
    render(<LoginDialog onLogin={onLogin} />);

    const usernameField = screen.getByRole("textbox", {
      name: "username-input",
    });
    const passwordField = screen.getByLabelText("password-input");
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: "Log in",
    });

    expect(loginButton.disabled).toEqual(true);
    fireEvent.input(usernameField, { target: { value: username } });
    fireEvent.input(passwordField, { target: { value: "top secret" } });

    await waitFor(async () => {
      expect(loginButton.disabled).toEqual(false);
    });

    expect(await getHiddenAlertsByClass()).toContain("LoginFailedAlert");
    expect(await getHiddenAlertsByClass()).toContain("ErrorAlert");
  });

  it("submits username and password on click", async () => {
    const correctPassword = "top secret";
    const onLogin: MockedFn<
      (username: string, password: string) => Promise<LoginResult>
    > = fn();

    render(<LoginDialog onLogin={onLogin} />);

    onLogin.mockResolvedValue("SUCCESS");
    const usernameField = screen.getByRole("textbox", {
      name: "username-input",
    });
    const passwordField = screen.getByLabelText("password-input");
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: "Log in",
    });

    fireEvent.input(usernameField, { target: { value: username } });
    fireEvent.input(passwordField, { target: { value: correctPassword } });

    fireEvent.click(loginButton);
    await waitFor(() => {
      expect(onLogin).toBeCalledWith(username, correctPassword);
    });

    await waitFor(async () => {
      const actual = screen.queryByRole("dialog", { name: "admin-login" });
      expect(actual).toBeNull();
    });
  });

  it("shows an error message if login failed", async () => {
    const wrongPassword = "top secret";
    const onLogin: MockedFn<
      (username: string, password: string) => Promise<LoginResult>
    > = fn();
    onLogin.mockResolvedValue("FAILURE");
    render(<LoginDialog onLogin={onLogin} />);

    const usernameField = screen.getByRole("textbox", {
      name: "username-input",
    });
    const passwordField = screen.getByLabelText("password-input");
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: "Log in",
    });

    fireEvent.input(usernameField, { target: { value: username } });
    fireEvent.input(passwordField, { target: { value: wrongPassword } });
    fireEvent.click(loginButton);

    expect(
      await screen.findByRole("alert", { name: "login-failed" }),
    ).toBeVisible();
    expect(await getHiddenAlertsByClass()).toContain("ErrorAlert");
  });

  it("shows an error message if an error occurred", async () => {
    const onLogin: MockedFn<
      (username: string, password: string) => Promise<LoginResult>
    > = fn();
    onLogin.mockRejectedValue(undefined);
    render(<LoginDialog onLogin={onLogin} />);

    const usernameField = screen.getByRole("textbox", {
      name: "username-input",
    });
    const passwordField = screen.getByLabelText("password-input");
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: "Log in",
    });

    fireEvent.input(usernameField, { target: { value: username } });
    fireEvent.input(passwordField, { target: { value: "anypwd" } });
    fireEvent.click(loginButton);

    expect(await screen.findByRole("alert", { name: "error" })).toBeVisible();
    expect(await getHiddenAlertsByClass()).toContain("LoginFailedAlert");
  });
});
