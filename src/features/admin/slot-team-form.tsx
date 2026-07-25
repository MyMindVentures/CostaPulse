"use client";

import { useState, useTransition } from "react";
import { assignSlotTeamAction } from "@/server/admin/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  slotId: string;
  teamMembers: Array<{ id: string; display_name: string; is_active: boolean }>;
  initialTeamMemberIds: string[];
};

export function AdminSlotTeamForm({
  slotId,
  teamMembers,
  initialTeamMemberIds
}: Props) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(initialTeamMemberIds);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeMembers = teamMembers.filter((member) => member.is_active);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  }

  function onSave() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await assignSlotTeamAction({
        slotId,
        teamMemberIds: selected,
        primaryTeamMemberId: selected[0] ?? null
      });
      if (result.ok) {
        setMessage("Team assignment saved");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="grid gap-3">
      <Label>Assign team</Label>
      <div className="flex flex-wrap gap-2">
        {activeMembers.map((member) => {
          const active = selected.includes(member.id);
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => toggle(member.id)}
              className={`min-h-11 rounded-md border px-3 py-2 text-sm ${
                active
                  ? "border-coral bg-coral/10 text-ink"
                  : "border-border bg-panel text-muted"
              }`}
              disabled={pending}
              aria-pressed={active}
            >
              {member.display_name}
            </button>
          );
        })}
      </div>
      <Button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="min-h-11 w-fit"
        variant="outline"
      >
        Save team
      </Button>
      {message ? (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Assignment failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
