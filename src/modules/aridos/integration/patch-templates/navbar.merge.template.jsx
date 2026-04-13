// TEMPLATE: merge sobre navbar/sidebar existente
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { createAridosNavItems } from "@/modules/aridos/integration/runtime/createAridosNavItems";
import { useAridosAppBindings } from "@/modules/aridos/integration/useAridosAppBindings.example";

export default function AdminNavbarAridosBlock() {
  const bindings = useAridosAppBindings();

  const items = useMemo(
    () => createAridosNavItems({
      hasSectionAccess: bindings.hasSectionAccess,
      basePath: "/aridos",
    }),
    [bindings]
  );

  if (!items.length) return null;

  return (
    <div className="menu rounded-box bg-base-200 p-2">
      <div className="px-3 py-2 text-xs font-semibold uppercase opacity-60">Áridos</div>
      {items.map((item) => (
        <NavLink key={item.key} to={item.to} className="btn btn-ghost justify-start">
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
