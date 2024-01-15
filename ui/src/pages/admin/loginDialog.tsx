import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import styled from "styled-components";
import { ButtonRow, FormRow } from "../../components/dialog";

const LoginButton = styled.button`
  width: fit-content;
`;

export const LoginDialog = ({ onLogin }: { onLogin: () => void }) => {
  const [valid, setValid] = useState(false);
  // TODO: pull out this state and registration form
  const [nameInput, setNameInput] = useState("");

  return (
    <Dialog.Root modal={true} open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content className="DialogContent" aria-label={"admin-login"}>
            <div>
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
                    setValid(e.currentTarget.checkValidity());
                    // setNameInput(e.currentTarget.value);
                  }}
                  placeholder={"Enter the admin password"}
                />
              </FormRow>
              <ButtonRow>
                <LoginButton onClick={onLogin} disabled={!valid}>
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
