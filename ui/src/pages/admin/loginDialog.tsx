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
  onLogin,
}: {
  onLogin: (username: string, password: string) => Promise<LoginResult>;
}) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [open, setOpen] = useState(true);
  const [showingLoginFailed, setShowingLoginFailed] = useState(false);
  const [showingError, setShowingError] = useState(false);

  const isValid: () => boolean = () => {
    return usernameInput.length > 0 && passwordInput.length > 0;
  };

  return (
    <Dialog.Root modal={true} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content className="DialogContent" aria-label={"admin-login"}>
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
                  placeholder={"Enter your password"}
                  aria-label={"password-input"}
                />
              </FormRow>
              <ButtonRow>
                <Dialog.Close asChild>
                  <button
                    onClick={async () => {
                      try {
                        const result = await onLogin(
                          usernameInput,
                          passwordInput,
                        );
                        if (result == "SUCCESS") {
                          // console.log("TODO: close dialog");
                          setOpen(false);
                        } else {
                          setShowingError(false);
                          setShowingLoginFailed(true);
                        }
                        //TODO: error handling
                        //TODO: handle login failure
                        //TODO: shutdown on success
                      } catch (e) {
                        console.log("Error when attempting login", e);
                        setShowingError(true);
                        setShowingLoginFailed(false);
                      }
                    }}
                    disabled={!isValid()}
                  >
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
