import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import styled from "styled-components";
import { RegisterUser } from "../services/userService";
import { ButtonRow, FormRow } from "./dialog";

const RegisterButton = styled.button`
  width: fit-content;
`;

export const RegistrationForm = ({
  registerUser,
  onLogin,
}: {
  registerUser: RegisterUser;
  onLogin: () => void;
}) => {
  const [valid, setValid] = useState(false);

  const [nameInput, setNameInput] = useState("");

  // TODO: test coverage for this logic

  const submitRegistration = () => {
    registerUser({ name: nameInput }).then((response) => {
      localStorage.setItem("token", response.token);
      onLogin();
    });
  };

  return (
    <Dialog.Root modal={true} open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay">
          <Dialog.Content
            className="DialogContent"
            aria-label={"registration-form"}
          >
            <div>
              <div>
                The concert is over and registration is now disabled. We hope to
                see you again!
              </div>
              {/*<FormRow>*/}
              {/*  /!* TODO: I think this `htmlFor` should be "name" *!/*/}
              {/*  <Label className="formLabel" htmlFor={"emailAddress"}>*/}
              {/*    Name*/}
              {/*  </Label>*/}
              {/*  <input*/}
              {/*      id={"name"}*/}
              {/*      required={true}*/}
              {/*      autoCapitalize={"off"}*/}
              {/*      autoCorrect={"off"}*/}
              {/*      minLength={2}*/}
              {/*      onInput={(e) => {*/}
              {/*        setValid(e.currentTarget.checkValidity());*/}
              {/*        setNameInput(e.currentTarget.value);*/}
              {/*      }}*/}
              {/*      placeholder={"Enter your full name"}*/}
              {/*  />*/}
              {/*</FormRow>*/}
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
