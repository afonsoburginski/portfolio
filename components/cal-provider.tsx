"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export function CalProvider({ children }: Props) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          light: {
            "--cal-brand": "#000000",
          },
          dark: {
            "--cal-brand": "#ffffff",
          },
        },
      });
    })();
  }, []);

  return <>{children}</>;
}


