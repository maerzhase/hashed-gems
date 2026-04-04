import type { Meta, StoryObj } from "@storybook/react";
import {
  HashedGem,
  HashedGemGradient,
} from "@/components/primitives/hashed-gem";
import {
  CUT_TYPES,
  GEM_TYPES,
  RARITIES,
  getCutVariant,
  getCutVariantLabel,
  getGemProperties,
} from "@/lib/gem";
import type { CutType, Rarity } from "@/lib/gem";

const meta: Meta<typeof HashedGem> = {
  title: "Primitives/HashedGem",
  component: HashedGem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: { type: "range", min: 24, max: 256, step: 8 } },
    seed: { control: "text" },
    gemType: { control: "select", options: GEM_TYPES },
    cutType: { control: "select", options: CUT_TYPES },
  },
};

export default meta;
type Story = StoryObj<typeof HashedGem>;

export const Default: Story = {
  args: { size: 96, seed: "alice" },
};

const SEED_NAMES = [
  "alice",
  "bob",
  "0x1a2b3c",
  "satoshi",
  "vitalik",
  "carol",
  "dave",
  "eve",
  "frank",
  "grace",
];

const VARIANCE_SEEDS = [
  "aurora",
  "marble",
  "ember",
  "solstice",
  "tide",
  "velvet",
  "quartz",
  "nova",
];

const GEM_TYPES_DATA = GEM_TYPES.map((gemType) => ({
  gemType,
  label: gemType.charAt(0).toUpperCase() + gemType.slice(1).replace(/-/g, " "),
}));

const CUT_TYPES_DATA = CUT_TYPES.map((cutType) => ({
  cutType,
  label: cutType.charAt(0).toUpperCase() + cutType.slice(1).replace(/-/g, " "),
}));

const MOTION_STORY_CANDIDATES = [
  ...SEED_NAMES,
  ...VARIANCE_SEEDS,
  ...Array.from({ length: 12000 }, (_, index) => `motion-${index}`),
];

function formatTitle(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function findStorySeed(
  predicate: (
    seed: string,
    properties: ReturnType<typeof getGemProperties>,
  ) => boolean,
): string | null {
  for (const seed of MOTION_STORY_CANDIDATES) {
    const properties = getGemProperties(seed);
    if (predicate(seed, properties)) {
      return seed;
    }
  }

  return null;
}

function getSeedForVariant(cutType: CutType, variantLabel: string): string {
  return (
    findStorySeed((seed) => getCutVariant(seed, cutType) === variantLabel) ??
    "alice"
  );
}

function getSeedForRarity(
  rarity: Rarity,
  cutType: CutType,
  preferredVariant: string,
): string {
  return (
    findStorySeed(
      (seed, properties) =>
        properties.rarityName === rarity &&
        getCutVariant(seed, cutType) === preferredVariant,
    ) ??
    findStorySeed((_seed, properties) => properties.rarityName === rarity) ??
    "alice"
  );
}

const MOTION_FAMILY_NOTES: Record<CutType, string> = {
  "round-brilliant": "Crisp sparkle with quicker scintillation.",
  princess: "Crisp sparkle with a more angular pulse.",
  "emerald-step": "Directional sweep with cleaner light travel.",
  cushion: "Soft bloom with slower cadence.",
  rose: "Soft bloom with petal-like breathing.",
  firework: "Radiant pulse with brighter bursts.",
  jubilee: "Radiant pulse with crown-heavy flashes.",
};

const ROUND_VARIANT_SEEDS = [
  {
    variant: "classic",
    seed: getSeedForVariant("round-brilliant", "classic"),
  },
  {
    variant: "open",
    seed: getSeedForVariant("round-brilliant", "open"),
  },
  {
    variant: "starburst",
    seed: getSeedForVariant("round-brilliant", "starburst"),
  },
];

const ROSE_VARIANT_SEEDS = [
  {
    variant: "tight",
    seed: getSeedForVariant("rose", "tight"),
  },
  {
    variant: "balanced",
    seed: getSeedForVariant("rose", "balanced"),
  },
  {
    variant: "bloom",
    seed: getSeedForVariant("rose", "bloom"),
  },
];

const RARITY_INSPECTION_CUT: CutType = "jubilee";
const RARITY_INSPECTION_GEM_TYPE = "sapphire";

const RARITY_COMPARISON_SEEDS = RARITIES.map((rarity) => ({
  rarity,
  seed: getSeedForRarity(rarity, RARITY_INSPECTION_CUT, "classic"),
}));

const HELPER_ATTRIBUTE_ROWS = [
  {
    label: "Gem type",
    getValue: (properties: ReturnType<typeof getGemProperties>) =>
      properties.gemTypeName,
  },
  {
    label: "Cut type",
    getValue: (properties: ReturnType<typeof getGemProperties>) =>
      properties.cutTypeName,
  },
  {
    label: "Cut variant",
    getValue: (
      properties: ReturnType<typeof getGemProperties> & {
        cutVariantName: string;
      },
    ) => properties.cutVariantName,
  },
  {
    label: "Rarity",
    getValue: (properties: ReturnType<typeof getGemProperties>) =>
      properties.rarityName,
  },
  {
    label: "Caustic count",
    getValue: (properties: ReturnType<typeof getGemProperties>) =>
      properties.causticCount,
  },
];

export const SeedVariations: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 16,
      }}
    >
      {SEED_NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <HashedGem size={80} seed={name} />
          <span style={{ fontSize: 11, opacity: 0.6 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const HelperAttributes: Story = {
  args: {
    seed: "alice",
    size: 144,
    static: true,
  },
  render: ({
    seed,
    size = 144,
    className,
    static: isStatic,
    gemType,
    cutType,
  }) => {
    const properties = getGemProperties(seed);
    const resolvedCutType = cutType ?? properties.cutTypeName;
    const helperProperties = {
      ...properties,
      cutTypeName: resolvedCutType,
      cutVariantName: getCutVariantLabel(getCutVariant(seed, resolvedCutType)),
    };

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, auto) minmax(240px, 320px)",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <HashedGem
            size={size}
            seed={seed}
            className={className}
            static={isStatic}
            gemType={gemType}
            cutType={cutType}
          />
        </div>
        <div
          style={{
            display: "grid",
            gap: 10,
            minWidth: 0,
            padding: 16,
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 16,
            background: "rgba(255, 255, 255, 0.04)",
          }}
        >
          {HELPER_ATTRIBUTE_ROWS.map(({ label, getValue }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                fontSize: 12,
              }}
            >
              <span style={{ opacity: 0.6 }}>{label}</span>
              <strong style={{ textTransform: "capitalize" }}>
                {getValue(helperProperties)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
      {[24, 32, 48, 64, 96, 128].map((size) => (
        <HashedGem key={size} size={size} seed="alice" />
      ))}
    </div>
  ),
};

export const GemTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 16,
        }}
      >
        {GEM_TYPES_DATA.map(({ gemType, label }) => (
          <div
            key={gemType}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <HashedGem
              size={80}
              seed="showcase"
              gemType={gemType}
              cutType="round-brilliant"
            />
            <span style={{ fontSize: 11, opacity: 0.6 }}>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
          gap: 16,
        }}
      >
        {CUT_TYPES_DATA.map(({ cutType, label }) => (
          <div
            key={cutType}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <HashedGem
              size={80}
              seed="showcase"
              gemType="diamond"
              cutType={cutType}
            />
            <span style={{ fontSize: 11, opacity: 0.6 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const CutSeedVariance: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {CUT_TYPES_DATA.map(({ cutType, label }) => (
        <div
          key={cutType}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{label}</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {VARIANCE_SEEDS.map((seed) => (
              <div
                key={`${cutType}-${seed}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <HashedGem
                  size={72}
                  seed={seed}
                  gemType="diamond"
                  cutType={cutType}
                />
                <span style={{ fontSize: 10, opacity: 0.55 }}>{seed}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const MotionByCutFamily: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 18, width: 760 }}
    >
      {CUT_TYPES_DATA.map(({ cutType, label }) => (
        <div
          key={cutType}
          style={{
            display: "grid",
            gridTemplateColumns: "112px minmax(0, 1fr)",
            alignItems: "center",
            gap: 18,
            padding: 16,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 18,
            background: "rgba(255, 255, 255, 0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HashedGem
              seed="motion-family"
              gemType="diamond"
              cutType={cutType}
              size={88}
            />
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: 13 }}>{label}</strong>
            <span style={{ fontSize: 12, opacity: 0.62 }}>
              {MOTION_FAMILY_NOTES[cutType]}
            </span>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const MotionVariantComparison: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 860 }}
    >
      {[
        {
          cutType: "round-brilliant" as const,
          label: "Round Brilliant",
          note: "Faster/tighter versus slower/broader crisp motion.",
          samples: ROUND_VARIANT_SEEDS,
        },
        {
          cutType: "rose" as const,
          label: "Rose",
          note: "Tight, balanced, and bloom variants within the softer family.",
          samples: ROSE_VARIANT_SEEDS,
        },
      ].map(({ cutType, label, note, samples }) => (
        <div
          key={cutType}
          style={{
            display: "grid",
            gap: 14,
            padding: 16,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 18,
            background: "rgba(255, 255, 255, 0.04)",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: 13 }}>{label}</strong>
            <span style={{ fontSize: 12, opacity: 0.62 }}>{note}</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {samples.map(({ variant, seed }) => (
              <div
                key={`${cutType}-${variant}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <HashedGem
                  seed={seed}
                  gemType="diamond"
                  cutType={cutType}
                  size={112}
                />
                <strong style={{ fontSize: 12, textTransform: "capitalize" }}>
                  {getCutVariantLabel(getCutVariant(seed, cutType))}
                </strong>
                <span style={{ fontSize: 10, opacity: 0.55 }}>{seed}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const MotionRarityComparison: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 14, width: 760 }}
    >
      <span style={{ fontSize: 12, opacity: 0.62 }}>
        Inspection setup: Sapphire + Jubilee cut, to keep the asterism readable
        while rarity increases.
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {RARITY_COMPARISON_SEEDS.map(({ rarity, seed }) => (
          <div
            key={rarity}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: 16,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 18,
              background: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <HashedGem
              seed={seed}
              gemType={RARITY_INSPECTION_GEM_TYPE}
              cutType={RARITY_INSPECTION_CUT}
              size={104}
            />
            <strong style={{ fontSize: 12, textTransform: "capitalize" }}>
              {rarity}
            </strong>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              {formatTitle(
                getCutVariantLabel(getCutVariant(seed, RARITY_INSPECTION_CUT)),
              )}
            </span>
            <span style={{ fontSize: 10, opacity: 0.55 }}>{seed}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const RarityFlareInspection: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, width: 820 }}
    >
      <span style={{ fontSize: 12, opacity: 0.62 }}>Sapphire + Jubilee</span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {RARITY_COMPARISON_SEEDS.map(({ rarity, seed }) => (
          <div
            key={`${rarity}-flare`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <HashedGem
              seed={seed}
              gemType={RARITY_INSPECTION_GEM_TYPE}
              cutType={RARITY_INSPECTION_CUT}
              size={128}
              resolution={384}
            />
            <strong style={{ fontSize: 12, textTransform: "capitalize" }}>
              {rarity}
            </strong>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const SquareVsRounded: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
          Square (default)
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {["alice", "bob", "satoshi"].map((seed) => (
            <HashedGem key={seed} size={80} seed={seed} />
          ))}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
          Rounded (className=&quot;rounded-full&quot;)
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {["alice", "bob", "satoshi"].map((seed) => (
            <HashedGem
              key={seed}
              size={80}
              seed={seed}
              className="rounded-full"
            />
          ))}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
          Rounded corners (className=&quot;rounded-xl&quot;)
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {["alice", "bob", "satoshi"].map((seed) => (
            <HashedGem
              key={seed}
              size={80}
              seed={seed}
              className="rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const StaticMode: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 12, opacity: 0.5 }}>
        Static (single frame, no animation — great for lists)
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        {["alice", "bob", "carol", "dave", "eve"].map((seed) => (
          <HashedGem key={seed} size={64} seed={seed} static />
        ))}
      </div>
      <p style={{ fontSize: 12, opacity: 0.5 }}>Animated (default)</p>
      <div style={{ display: "flex", gap: 12 }}>
        {["alice", "bob", "carol", "dave", "eve"].map((seed) => (
          <HashedGem key={seed} size={64} seed={seed} />
        ))}
      </div>
    </div>
  ),
};

export const GradientVsWebGL: Story = {
  args: {
    seed: "alice",
    size: 96,
  },
  render: ({ seed, size = 96, gemType, cutType }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <HashedGemGradient
          seed={seed}
          size={size}
          gemType={gemType}
          cutType={cutType}
        />
        <span style={{ fontSize: 10, opacity: 0.5 }}>Gradient</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <HashedGem
          seed={seed}
          size={size}
          gemType={gemType}
          cutType={cutType}
        />
        <span style={{ fontSize: 10, opacity: 0.5 }}>WebGL</span>
      </div>
    </div>
  ),
};

export const AvatarList: Story = {
  render: () => {
    const names = [
      "alice",
      "bob",
      "carol",
      "dave",
      "eve",
      "frank",
      "grace",
      "heidi",
      "ivan",
      "judy",
      "karl",
      "linda",
      "mike",
      "nancy",
      "oscar",
      "pat",
      "quinn",
      "rosa",
      "steve",
      "tina",
      "tory",
      "uma",
      "ursula",
      "victor",
      "violet",
      "wendy",
      "xander",
      "yuki",
      "zara",
      "zoe",
      "satoshi",
      "vitalik",
      "0x1a2b3c",
      "nakamoto",
      "hal",
      "nick",
      "wei",
      "adam",
      "gavin",
      "charles",
      "silvio",
      "linus",
      "ada",
      "turing",
      "dijkstra",
      "knuth",
      "ritchie",
      "gosling",
      "haskell",
      "fermat",
      "euler",
      "gauss",
      "riemann",
      "noether",
    ];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 600 }}>
        {names.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              width: 56,
            }}
          >
            <HashedGem size={48} seed={name} className="rounded-full" />
            <p
              style={{
                fontSize: 9,
                opacity: 0.6,
                margin: 0,
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {name}
            </p>
          </div>
        ))}
      </div>
    );
  },
};
