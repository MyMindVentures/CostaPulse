"use client";

type RoleSelectorProps = {
  roles: { id: string; label: string; founder: boolean }[];
  label: string;
};

export function RoleSelector({ roles, label }: RoleSelectorProps) {
  return (
    <nav aria-label={label} className="flex snap-x gap-3 overflow-x-auto pb-3">
      {roles.map((role) => (
        <a
          key={role.id}
          href={`#${role.id}`}
          className={`button min-h-11 shrink-0 snap-start ${role.founder ? "button-coral" : "button-outline"}`}
        >
          {role.label}
        </a>
      ))}
    </nav>
  );
}
