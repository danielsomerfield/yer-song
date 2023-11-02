import React from "react";
import { RegisterUser } from "../../services/userService";
import { RegistrationForm } from "./registrationForm";
import { NavPanel } from "../../components/navPanel";
import { NavigateFunction } from "react-router-dom";

export const Home = ({
  registerUser,
  nav,
}: {
  registerUser: RegisterUser;
  nav: NavigateFunction;
}) => {
  return (
    <>
      <p>TODO: welcome text</p>
      <RegistrationForm registerUser={registerUser} />
      <NavPanel nav={nav} />
    </>
  );
};
