"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

type ConfirmSubmitButtonProps = React.ComponentProps<typeof Button> & {
  confirmMessage: string;
};

export function ConfirmSubmitButton({
  confirmMessage,
  onClick,
  type = "submit",
  ...props
}: ConfirmSubmitButtonProps) {
  return (
    <Button
      type={type}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
      {...props}
    />
  );
}
