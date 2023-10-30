import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { PropsWithChildren, useState } from "react";
import styled from "styled-components";

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

export const Home = () => {
  const [valid, setValid] = useState(false);
  const [formShowing, setFormShowing] = useState(true);
  const submitRegistration = () => {
    setFormShowing(false);
    console.log("Submitting registration");
  };

  // TODO: test coverage for this logic
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
