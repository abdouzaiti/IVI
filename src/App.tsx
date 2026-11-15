import * as React from "react";
import { ArrowDown, ArrowUpRight, Moon, RotateCw, Sun } from "lucide-react";
import { ClothingRailHero } from "./components/ClothingRailHero";
import { GarmentThumbnail } from "./components/GarmentIllustration";
import { BagDrawer, type BagItem } from "./components/BagDrawer";
import { GARMENT_COLLECTION, type CatalogGarment } from "./data/garments";

type CategoryFilter = "All" | CatalogGarment["category"];

const AVAILABLE_CATEGORIES = Array.from(
  new Set(GARMENT_COLLECTION.map((g) => g.category)),
) as CatalogGarment["category"][];

const CATEGORIES: CategoryFilter[] =
  AVAILABLE_CATEGORIES.length > 1 ? ["All", ...AVAILABLE_CATEGORIES] : [];

export default function App() {
  const [hanger, setHanger] = React.useState<"wood" | "matte" | "none">("wood");
  const [autoplay, setAutoplay] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [category, setCategory] = React.useState<CategoryFilter>("All");
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(GARMENT_COLLECTION.map((g) => [g.id, "M"])),
  );
  const [flippedCards, setFlippedCards] = React.useState<Record<string, boolean>>({});
  const [bag, setBag] = React.useState<BagItem[]>([]);
  const [bagOpen, setBagOpen] = React.useState(false);
  const [justAddedId, setJustAddedId] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);

  const filteredGarments = React.useMemo(
    () =>
      category === "All"
        ? GARMENT_COLLECTION
        : GARMENT_COLLECTION.filter((item) => item.category === category),
    [category],
  );

  const addToBag = (garment: CatalogGarment) => {
    const size = selectedSizes[garment.id] ?? "M";
    setBag((prev) => {
      const existing = prev.find((i) => i.garment.id === garment.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.garment.id === garment.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { garment, size, quantity: 1 }];
    });
    setJustAddedId(garment.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === garment.id ? null : curr));
    }, 1200);
  };

  const updateQty = (id: string, size: string, delta: number) => {
    setBag((prev) =>
      prev
        .map((item) =>
          item.garment.id === id && item.size === size
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromBag = (id: string, size: string) => {
    setBag((prev) => prev.filter((item) => !(item.garment.id === id && item.size === size)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Navigation Bar: Strict 3-zone contract */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3">
          <a
            href="#rail"
            className="inline-flex items-center font-serif text-2xl font-medium tracking-[0.06em] text-foreground whitespace-nowrap shrink-0"
          >
            {logoError ? (
              <span>IVI</span>
            ) : (
              <span className="inline-flex h-12 w-24 items-center justify-start overflow-hidden">
                <img
                  src="/logo.png"
                  alt="IVI"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-full w-full origin-center scale-[2.2] object-contain"
                />
              </span>
            )}
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm text-muted-foreground"
          >
            <a
              href="#rail"
              className="transition-colors hover:text-foreground whitespace-nowrap shrink-0"
            >
              The Rail
            </a>
            <a
              href="#collection"
              className="transition-colors hover:text-foreground whitespace-nowrap shrink-0"
            >
              Collection
            </a>
            <a
              href="#materials"
              className="transition-colors hover:text-foreground whitespace-nowrap shrink-0"
            >
              Materials
            </a>
            <a
              href="#atelier"
              className="transition-colors hover:text-foreground whitespace-nowrap shrink-0"
            >
              Atelier
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="inline-flex items-center gap-2 bg-foreground px-4 py-2 text-xs font-medium tracking-wide text-background transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Bag</span>
              <span className="font-mono tabular-nums">({bagCount})</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Interactive Clothing Rail Hero */}
        <div id="rail">
          <ClothingRailHero
            items={GARMENT_COLLECTION}
            eyebrow="Autumn / Winter 2026"
            heading="Autumn / Winter Edit on the Rail"
            caption="Glide across the rail to turn each garment forward, drag along the bar, or click any piece for full 360° inspection."
            autoplay={autoplay}
            hanger={hanger}
            action={
              <a
                href="#collection"
                className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-surface whitespace-nowrap"
              >
                <span>Explore the Collection</span>
                <ArrowDown className="size-3.5" />
              </a>
            }
          />
        </div>

        {/* Studio Rail Configuration Bar (placed cleanly below the hero, outside the top bar) */}
        <section
          aria-label="Rail presentation controls"
          className="border-y border-border bg-surface/60"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground">Hanger</span>
              <div
                role="group"
                aria-label="Hanger material"
                className="inline-flex border border-border bg-card p-0.5"
              >
                {(
                  [
                    { id: "wood", label: "Cedar Wood" },
                    { id: "matte", label: "Matte" },
                    { id: "none", label: "None" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setHanger(opt.id)}
                    aria-pressed={hanger === opt.id}
                    className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      hanger === opt.id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAutoplay((prev) => !prev)}
                aria-pressed={autoplay}
                className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-surface whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCw className={`size-3.5 ${autoplay ? "text-accent" : "text-muted-foreground"}`} />
                <span>{autoplay ? "Autoplay Active" : "Autoplay Paused"}</span>
              </button>

              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                aria-pressed={darkMode}
                className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-surface whitespace-nowrap shrink-0 cursor-pointer"
              >
                {darkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                <span>{darkMode ? "Daylight" : "Evening"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Featured Collection Grid */}
        <section id="collection" className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Seasonal Edit
              </p>
              <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
                The Complete Seasonal Edit
              </h2>
            </div>

            {CATEGORIES.length > 0 && (
              <div
                role="tablist"
                aria-label="Filter collection by category"
                className="flex flex-wrap items-center gap-1 border border-border bg-card p-1"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={category === cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      category === cat
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGarments.map((item) => {
              const selectedSize = selectedSizes[item.id] ?? "M";
              const isBack = Boolean(flippedCards[item.id]);
              const isAdded = justAddedId === item.id;

              return (
                <article
                  key={item.id}
                  className="group flex flex-col border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface p-6">
                    <GarmentThumbnail
                      kind={item.kind}
                      color={item.color}
                      trim={item.trim}
                      side={isBack ? "back" : "front"}
                      image={item.image}
                      backImage={item.backImage}
                      alt={item.name}
                      imageScale={item.imageScale}
                      imageOffsetY={item.imageOffsetY}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFlippedCards((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      aria-label={`View ${isBack ? "front" : "back"} of ${item.name}`}
                      className="absolute right-4 bottom-4 border border-border bg-card/90 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xs transition-colors hover:text-foreground whitespace-nowrap cursor-pointer"
                    >
                      {isBack ? "Show Front" : "Show Back"}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-5 p-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.fabricOrigin}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{item.weight}</span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between gap-4">
                        <h3 className="text-base font-semibold tracking-tight text-card-foreground">
                          {item.name}
                        </h3>
                        <span className="font-mono text-sm font-medium tabular-nums text-card-foreground shrink-0">
                          ${item.price}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                      <div
                        role="group"
                        aria-label={`Size for ${item.name}`}
                        className="inline-flex items-center gap-1"
                      >
                        {item.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() =>
                              setSelectedSizes((prev) => ({ ...prev, [item.id]: sz }))
                            }
                            aria-pressed={selectedSize === sz}
                            className={`size-8 font-mono text-xs transition-colors cursor-pointer ${
                              selectedSize === sz
                                ? "bg-foreground text-background"
                                : "border border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToBag(item)}
                        className="inline-flex items-center justify-center bg-foreground px-4 py-2 text-xs font-medium tracking-wide text-background transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {isAdded ? "Added" : "Add to Bag"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Craftsmanship & Provenance Section */}
        <section id="materials" className="border-t border-border bg-surface/50">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Mill Provenance
              </p>
              <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
                Cut for drape, woven to hold its line on the hanger.
              </h2>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                Every garment on the rail is patterned around natural shoulder geometry and heavy,
                high-recovery yarns so sleeves fall cleanly without synthetic stiffness.
              </p>
            </div>

            <div className="divide-y divide-border border-y border-border lg:col-span-7">
              <div className="grid gap-2 py-6 sm:grid-cols-3 sm:items-baseline">
                <span className="font-mono text-xs text-muted-foreground">01. Jersey & Fleece</span>
                <p className="text-sm font-medium text-foreground sm:col-span-2">
                  290gsm Portuguese organic cotton &amp; 520gsm Wakayama loopwheel fleece knitted under low tension.
                </p>
              </div>
              <div className="grid gap-2 py-6 sm:grid-cols-3 sm:items-baseline">
                <span className="font-mono text-xs text-muted-foreground">02. Fine Knitwear</span>
                <p className="text-sm font-medium text-foreground sm:col-span-2">
                  5-gauge extrafine Australian merino spun in Biella with linked saddle shoulders and tubular ribs.
                </p>
              </div>
              <div className="grid gap-2 py-6 sm:grid-cols-3 sm:items-baseline">
                <span className="font-mono text-xs text-muted-foreground">03. Heavy Outerwear</span>
                <p className="text-sm font-medium text-foreground sm:col-span-2">
                  410gsm Scottish cotton moleskin and 640gsm Prato double-faced wool-cashmere melton, hand-felled.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer id="atelier" className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 py-12 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center font-serif text-base font-medium tracking-[0.06em] text-foreground">
              {logoError ? (
                <span>IVI</span>
              ) : (
                <span className="inline-flex h-7 w-14 items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="IVI"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                    className="h-full w-full origin-center scale-[2.2] object-contain"
                  />
                </span>
              )}
            </span>
            <span aria-hidden="true">·</span>
            <span>Bredgade 42, Copenhagen</span>
            <span aria-hidden="true">·</span>
            <span>Complimentary courier dispatch above $300</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#rail"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground whitespace-nowrap"
            >
              <span>Back to Rail</span>
              <ArrowUpRight className="size-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="transition-colors hover:text-foreground whitespace-nowrap cursor-pointer"
            >
              Open Bag ({bagCount})
            </button>
          </div>
        </div>
      </footer>

      <BagDrawer
        open={bagOpen}
        items={bag}
        onClose={() => setBagOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeFromBag}
        onClear={() => setBag([])}
      />
    </div>
  );
}
