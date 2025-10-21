"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function SavedSearchesList({ items }: { items: any[] }) {
  const [list, setList] = useState(items);
  const { toast } = useToast();

  const toggleAlert = async (id: string, current: boolean) => {
    const res = await fetch(`/api/saved-searches/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertEnabled: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setList((prev: any[]) => prev.map((i) => (i._id === id ? updated : i)));
      toast({
        title: "Updated",
        description: `Alerts ${!current ? "enabled" : "disabled"}`,
      });
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    if (res.ok) {
      setList((prev: any[]) => prev.filter((i) => i._id !== id));
      toast({ title: "Deleted", description: "Saved search removed" });
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const toQueryString = (criteria: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(criteria || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && `${v}`.length > 0)
        params.set(k, String(v));
    });
    return params.toString();
  };

  if (!list?.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No saved searches yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your favorite filters to get alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => (
        <Card key={s._id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{s.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Alerts</span>
              <Switch
                checked={s.alertEnabled}
                onCheckedChange={() => toggleAlert(s._id, s.alertEnabled)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {s.alertEnabled
                ? `Frequency: ${s.alertFrequency}`
                : "Alerts disabled"}
            </div>
            <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(s.criteria, null, 2)}
            </pre>
            <div className="flex justify-between gap-2">
              <a
                className="text-sm underline"
                href={`/properties?${toQueryString(s.criteria)}`}
              >
                Run search
              </a>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => remove(s._id)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
