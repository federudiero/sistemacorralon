import React, { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { assertAridosBindings } from "./assertAridosBindings";
import { createAridosNavItems } from "./createAridosNavItems";
import { useAridosAppBindings } from "../useAridosAppBindings.example";
import { AridosSecurityProvider } from "../../security/AridosSecurityProvider.example";

export default function AridosAppRuntime() {
  const bindings = assertAridosBindings(useAridosAppBindings());

  const securityValue = useMemo(
    () => ({
      cuentaId: bindings.cuentaId,
      userEmail: bindings.userEmail,
      role: bindings.role,
      isAuthenticated: bindings.isAuthenticated,
      hasSectionAccess: bindings.hasSectionAccess,
      isReadOnlySection: bindings.isReadOnlySection,
      navItems: createAridosNavItems({
        hasSectionAccess: bindings.hasSectionAccess,
        basePath: bindings.basePath || "/aridos",
      }),
    }),
    [bindings]
  );

  return (
    <AridosSecurityProvider value={securityValue}>
      <Outlet />
    </AridosSecurityProvider>
  );
}
