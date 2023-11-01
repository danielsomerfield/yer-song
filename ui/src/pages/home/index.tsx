import React from "react";
import { RegisterUser } from "../../services/userService";
import { RegistrationForm } from "./registrationForm";

export const Home = ({ registerUser }: { registerUser: RegisterUser }) => {
  return (
    <>
      <div>Home</div>
      <RegistrationForm registerUser={registerUser} />
    </>
  );
};
