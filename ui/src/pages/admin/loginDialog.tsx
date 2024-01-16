import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import styled from "styled-components";
import { ButtonRow, FormRow } from "../../components/dialog";

const LoginButton = styled.button`
  width: fit-content;
`;

export const LoginDialog = ({
  onLogin,
}: {
  onLogin: (username: string, password: string) => void;
}) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const isValid: () => boolean = () => {
    return usernameInput.length > 0 && passwordInput.length > 0;
  };

  return (
    <Dialog.Root modal={true} open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content className="DialogContent" aria-label={"admin-login"}>
            <div>
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
                <LoginButton
                  onClick={() => {
                    onLogin(usernameInput, passwordInput);
                  }}
                  disabled={!isValid()}
                >
                  Log in
                </LoginButton>
              </ButtonRow>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
