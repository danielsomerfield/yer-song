import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { FormEvent, PropsWithChildren, useState } from "react";
import styled from "styled-components";
import { RegisterUser } from "../../services/userService";
import { getToken } from "../../http/tokenStore";

const FormStyle = styled.div``;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 2vh;
  margin-right: 2vh;
`;

const RegisterButton = styled.button`
  width: fit-content;
`;

const RegisterForm = ({ children }: PropsWithChildren) => {
  return <FormStyle>{children}</FormStyle>;
};

const ButtonRow = styled(FormRow)`
  flex-flow: row-reverse;
`;

export const Home = ({ registerUser }: { registerUser: RegisterUser }) => {
  const isRegistered = (): boolean => {
    return getToken() != null;
  };

  const [valid, setValid] = useState(false);
  const [formShowing, setFormShowing] = useState(!isRegistered());
  // TODO: pull out this state and registration form
  const [nameInput, setNameInput] = useState("");

  // TODO: test coverage for this logic
  const submitRegistration = () => {
    console.log("Submitting registration", { name: nameInput });
    registerUser({ name: nameInput }).then((response) => {
      console.log("response", response);
      localStorage.setItem("token", response.token);
      setFormShowing(false);
    });
  };

  return (
    <>
      <div>Home</div>
      <Dialog.Root modal={true} open={formShowing}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay">
            <Dialog.Content className="DialogContent">
              <RegisterForm>
                <FormRow>
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
                  <RegisterButton
                    onClick={submitRegistration}
                    disabled={!valid}
                  >
                    Register
                  </RegisterButton>
                </ButtonRow>
              </RegisterForm>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
