import { ToastProps } from "@radix-ui/react-toast";
import * as Toast from "@radix-ui/react-toast";
import React from "react";

export const ToastPopup = ({
  toastOpen,
  setToastOpen,
  text,
}: {
  toastOpen: boolean;
  setToastOpen: ToastProps["onOpenChange"];
  text: string;
}) => (
  <Toast.Root className={"Toast"} open={toastOpen} onOpenChange={setToastOpen}>
    <Toast.Description>{text}</Toast.Description>
  </Toast.Root>
);
