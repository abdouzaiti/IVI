import * as React from "react";
import { Minus, Plus, Trash2, X, Check } from "lucide-react";
import type { CatalogGarment } from "../data/garments";

export interface BagItem {
  garment: CatalogGarment;
  size: string;
  quantity: number;
}

interface BagDrawerProps {
  open: boolean;
  items: BagItem[];
  onClose: () => void;
  onUpdateQty: (id: string, size: string, delta: number) => void;
  onRemove: (id: string, size: string) => void;
  onClear: () => void;
}

export function BagDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemove,
  onClear,
}: BagDrawerProps) {
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [shippingCity, setShippingCity] = React.useState("");
  const [orderRef, setOrderRef] = React.useState<string | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = items.reduce((sum, entry) => sum + entry.garment.price * entry.quantity, 0);
  const shipping = subtotal >= 300 || subtotal === 0 ? 0 : 18;
  const total = subtotal + shipping;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const code = `IVI-${Math.floor(1040 + Math.random() * 8900)}`;
    setOrderRef(code);
    onClear();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-foreground/25 backdrop-blur-xs transition-opacity"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-2xl font-medium tracking-tight">IVI Bag</h2>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {items.reduce((acc, i) => acc + i.quantity, 0)} pcs
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {orderRef ? (
            <div className="flex h-full flex-col items-start justify-center gap-4 py-12">
              <div className="flex size-10 items-center justify-center border border-border bg-card text-foreground">
                <Check className="size-4" />
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground">Order {orderRef}</p>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Confirmed — Preparing Dispatch
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {customerName ? `${customerName}, your` : "Your"} IVI reservation has been logged
                  {shippingCity ? ` for ${shippingCity}` : ""}. Each garment is steamed and packed on cedar hangers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderRef(null);
                  onClose();
                }}
                className="mt-2 inline-flex items-center justify-center bg-foreground px-5 py-2.5 text-xs font-medium tracking-wide text-background transition-opacity hover:opacity-90 whitespace-nowrap"
              >
                Return to Rail
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-serif text-xl text-foreground">Your bag is currently empty</p>
              <p className="max-w-[30ch] text-sm text-muted-foreground">
                Inspect pieces directly on the rail or select a silhouette from the collection below.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((entry) => (
                <li
                  key={`${entry.garment.id}-${entry.size}`}
                  className="flex items-start justify-between gap-4 py-5 first:pt-0"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="size-12 shrink-0 border border-border"
                      style={{ backgroundColor: entry.garment.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{entry.garment.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Size {entry.size} · {entry.garment.category}
                      </p>
                      <div className="mt-3 inline-flex items-center border border-border bg-card">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${entry.garment.name}`}
                          onClick={() => onUpdateQty(entry.garment.id, entry.size, -1)}
                          className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs tabular-nums">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${entry.garment.name}`}
                          onClick={() => onUpdateQty(entry.garment.id, entry.size, 1)}
                          className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="font-mono text-sm tabular-nums">
                      ${(entry.garment.price * entry.quantity).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.garment.name}`}
                      onClick={() => onRemove(entry.garment.id, entry.size)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && !orderRef && (
          <form onSubmit={handleCheckout} className="border-t border-border bg-card px-6 py-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Courier Delivery {subtotal >= 300 ? "(Complimentary)" : ""}</span>
                <span className="font-mono tabular-nums">{shipping === 0 ? "Free" : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
                <span>Total</span>
                <span className="font-mono tabular-nums">${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder="Full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-2 border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="City"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-foreground px-5 py-3 text-xs font-medium tracking-wide text-background transition-opacity hover:opacity-90 whitespace-nowrap"
            >
              Complete Reservation — ${total.toLocaleString()}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
