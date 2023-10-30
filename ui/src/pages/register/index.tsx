import React, { PropsWithChildren } from "react";
import { Label } from "@radix-ui/react-label";
import styled from "styled-components";

const FormStyle = styled.div``;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const RegisterForm = ({ children }: PropsWithChildren) => {
  return <FormStyle>{children}</FormStyle>;
};

export const RegisterPage = () => {
  return (
    <>
      <header>Register to vote for yer song!</header>
      <RegisterForm>
        <FormRow>
          <Label className="formLabel" htmlFor={"emailAddress"}>
            Name
          </Label>
          <input id={"emailAddress"} />
        </FormRow>
      </RegisterForm>
    </>
  );
};
