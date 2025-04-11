"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

function SidebarButtonWrapper({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button {...props} suppressHydrationWarning>
      {children}
    </Button>
  );
}

export { SidebarButtonWrapper };
