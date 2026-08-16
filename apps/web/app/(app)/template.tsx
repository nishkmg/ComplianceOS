import { ReactNode } from "react";
import ServerAuthGuard from "./server-auth-guard";

/**
 * Server layout segment: re-created on every navigation, so the auth +
 * onboarding check runs on the server BEFORE the client page (and its tRPC
 * queries) renders. The client layout stays untouched — template.tsx is the
 * server-composable wrapper rendered as the layout's child.
 */
export default function ServerAuthTemplate({ children }: { children: ReactNode }) {
  return <ServerAuthGuard>{children}</ServerAuthGuard>;
}
