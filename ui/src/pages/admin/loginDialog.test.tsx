import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LoginDialog } from "./loginDialog";
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("the login dialog", () => {
  const username = "daniel";
  it("valid username and password enable the login button", async () => {
    const onLogin: MockedFn<(username: string, password: string) => boolean> =
      fn();
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
  });

  it("submits username and password on click", async () => {
    const correctPassword = "top secret";
    const onLogin: MockedFn<(username: string, password: string) => boolean> =
      fn();
    render(<LoginDialog onLogin={onLogin} />);

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
    expect(onLogin).toBeCalledWith(username, correctPassword);
  });
});
