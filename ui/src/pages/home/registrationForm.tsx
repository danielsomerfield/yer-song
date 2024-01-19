import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import styled from "styled-components";
import { getToken } from "../../http/tokenStore";
import { RegisterUser } from "../../services/userService";
import { ButtonRow, FormRow } from "../../components/dialog";

const RegisterButton = styled.button`
  width: fit-content;
`;

export const RegistrationForm = ({
  registerUser,
  isRegistered = () => getToken() != null,
  onLogin = () => {
    window.location.href = "/playlist";
  },
}: {
  registerUser: RegisterUser;
  isRegistered?: () => boolean;
  onLogin?: () => void;
}) => {
  const [valid, setValid] = useState(false);
  const [formShowing, setFormShowing] = useState(!isRegistered());
  // TODO: pull out this state and registration form
  const [nameInput, setNameInput] = useState("");

  // TODO: test coverage for this logic

  const submitRegistration = () => {
    registerUser({ name: nameInput }).then((response) => {
      localStorage.setItem("token", response.token);
      setFormShowing(false);
    });
  };

  // TODO: fix this hack
  if (!formShowing) {
    onLogin();
  }
  return (
    <Dialog.Root modal={true} open={formShowing}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content className="DialogContent">
            <div>
              <FormRow>
                {/* TODO: I think this `htmlFor` should be "name" */}
                <Label className="formLabel" htmlFor={"emailAddress"}>
                  Name
                </Label>
                <input
                  id={"name"}
                  required={true}
                  minLength={2}
                  onInput={(e) => {
                    setValid(e.currentTarget.checkValidity());
                    setNameInput(e.currentTarget.value);
                  }}
                  placeholder={"Enter your full name"}
                />
              </FormRow>
              <ButtonRow>
                <RegisterButton onClick={submitRegistration} disabled={!valid}>
                  Register
                </RegisterButton>
              </ButtonRow>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
