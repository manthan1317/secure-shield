"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function ButtonWrapper({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button {...props} suppressHydrationWarning>
      {children}
    </Button>
  );
}
