import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import styled from "styled-components";
import { ButtonRow, FormRow } from "../../components/dialog";

const LoginButton = styled.button`
  width: fit-content;
`;

export const LoginDialog = () => {
  const [valid, setValid] = useState(false);
  // TODO: pull out this state and registration form
  const [nameInput, setNameInput] = useState("");

  const submitLogin = () => {
    console.log("submitLogin()");
  };

  return (
    <Dialog.Root modal={true} open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content className="DialogContent" aria-label={"admin-login"}>
            <div>
              <FormRow>
                {/*<Label className="formLabel" htmlFor={"emailAddress"}>*/}
                {/*  Name*/}
                {/*</Label>*/}
                {/*<input*/}
                {/*  id={"name"}*/}
                {/*  required={true}*/}
                {/*  minLength={2}*/}
                {/*  onInput={(e) => {*/}
                {/*    setValid(e.currentTarget.checkValidity());*/}
                {/*    setNameInput(e.currentTarget.value);*/}
                {/*  }}*/}
                {/*  placeholder={"Enter your full name"}*/}
                {/*/>*/}
              </FormRow>
              <ButtonRow>
                <LoginButton onClick={submitLogin} disabled={!valid}>
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
