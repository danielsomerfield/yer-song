import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { ButtonRow, FormRow } from "../../components/dialog";
import styled from "styled-components";

export const LoginResults = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
} as const;

export type LoginResult = keyof typeof LoginResults;

const Alert = styled.span({
  //TODO: alert text resizes the login dialog. It shouldn't.
});

export const LoginDialog = ({
  onSubmit,
  onLogin,
  title = "Login",
}: {
  onSubmit: (username: string, password: string) => Promise<LoginResult>;
  onLogin: (result: LoginResult) => Promise<void>;
  title?: string;
}) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [open, setOpen] = useState(true);
  const [showingLoginFailed, setShowingLoginFailed] = useState(false);
  const [showingError, setShowingError] = useState(false);

  const isValid: () => boolean = () => {
    return usernameInput.length > 0 && passwordInput.length > 0;
  };

  const submitLogin = async () => {
    try {
      const result = await onSubmit(usernameInput, passwordInput);
      if (result == "SUCCESS") {
        setOpen(false);
      } else {
        setShowingError(false);
        setShowingLoginFailed(true);
      }
      await onLogin(result);
    } catch (e) {
      console.log("Error when attempting login", e);
      setShowingError(true);
      setShowingLoginFailed(false);
    }
  };
  return (
    <Dialog.Root modal={true} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content className="DialogContent">
            <Dialog.DialogTitle>{title}</Dialog.DialogTitle>
            <Alert
              className={"LoginFailedAlert"}
              aria-label={"login-failed"}
              role={"alert"}
              hidden={!showingLoginFailed}
            >
              Login failed. Are you sure your credentials are correct?
            </Alert>
            <Alert
              aria-label={"error"}
              role={"alert"}
              className={"ErrorAlert"}
              hidden={!showingError}
            >
              An error occurred while attempting login.
            </Alert>
            <div>
              <FormRow></FormRow>
              <FormRow>
                <Label className="formLabel" htmlFor={"username"}>
                  Username
                </Label>
                <input
                  id={"username"}
                  type={"text"}
                  required={true}
                  minLength={5}
                  autoCapitalize={"off"}
                  autoCorrect={"off"}
                  onInput={(e) => {
                    if (e.currentTarget.checkValidity()) {
                      setUsernameInput(e.currentTarget.value);
                    }
                  }}
                  placeholder={"Enter your username"}
                  aria-label={"username-input"}
                />
              </FormRow>
              <FormRow>
                <Label className="formLabel" htmlFor={"password"}>
                  Password
                </Label>
                <input
                  id={"password"}
                  type={"password"}
                  required={true}
                  minLength={5}
                  onInput={(e) => {
                    if (e.currentTarget.checkValidity()) {
                      setPasswordInput(e.currentTarget.value);
                    }
                  }}
                  onKeyUp={async (evt) => {
                    if (
                      evt.key == "Enter" &&
                      evt.currentTarget.checkValidity()
                    ) {
                      await submitLogin();
                    }
                  }}
                  placeholder={"Enter your password"}
                  aria-label={"password-input"}
                />
              </FormRow>
              <ButtonRow>
                <Dialog.Close asChild>
                  <button onClick={submitLogin} disabled={!isValid()}>
                    Log in
                  </button>
                </Dialog.Close>
              </ButtonRow>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
