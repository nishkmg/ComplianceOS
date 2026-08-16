import { ReactNode } from "react";
import { ServerAuthCheck } from "./server-auth-check";

export default function ServerAuthGuard({ children }: { children: ReactNode }) {
  return <ServerAuthCheck>{children}</ServerAuthCheck>;
}
