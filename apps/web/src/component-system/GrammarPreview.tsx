import type { Grammar } from "@/lib/componentGrammar";
import { enumerateAddresses } from "@/lib/componentGrammar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_SHOWN = 300;

export interface GrammarPreviewProps {
  grammar: Grammar;
}

function GrammarPreview({ grammar }: GrammarPreviewProps) {
  const addresses = enumerateAddresses(grammar);
  const shown = addresses.slice(0, MAX_SHOWN);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generated addresses</CardTitle>
          <CardDescription>
            Every walk from the root to a reachable surface or leaf — <span data-testid="address-count">{addresses.length}</span> total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex max-h-80 flex-col gap-0.5 overflow-y-auto font-mono text-xs text-muted-foreground">
            {shown.map((addr) => (
              <li key={addr}>{addr}</li>
            ))}
          </ul>
          {addresses.length > MAX_SHOWN && (
            <p className="mt-2 text-xs text-muted-foreground">
              …and {addresses.length - MAX_SHOWN} more, truncated for display.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Grammar (JSON)</CardTitle>
          <CardDescription>What an export step would hand to the color solver, once the two are connected.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(grammar, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}

export { GrammarPreview };
