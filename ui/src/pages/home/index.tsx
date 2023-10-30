import { NavPanel } from "../../components/navPanel";
import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import React, { PropsWithChildren } from "react";
import styled from "styled-components";

const FormStyle = styled.div``;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5vh;
`;

const RegisterButton = styled.button`
  width: fit-content;
`;

const RegisterForm = ({ children }: PropsWithChildren) => {
  return <FormStyle>{children}</FormStyle>;
};

export const Home = () => {
  return (
    <>
      <div>Home</div>
      <Dialog.Root modal={true} open={false}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay">
            <Dialog.Content className="DialogContent">
              <RegisterForm>
                <FormRow>
                  <Label className="formLabel" htmlFor={"emailAddress"}>
                    Name
                  </Label>
                  <input id={"emailAddress"} />
                </FormRow>
                <FormRow>
                  <RegisterButton>Register</RegisterButton>
                </FormRow>
              </RegisterForm>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
