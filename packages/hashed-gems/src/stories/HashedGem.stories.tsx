import type { Meta, StoryObj } from "@storybook/react";
import {
  HashedGem,
  HashedGemGradient,
} from "@/components/primitives/hashed-gem";
import {
  CUT_TYPES,
  GEM_TYPES,
  getCutVariant,
  getCutVariantLabel,
  getGemProperties,
} from "@/lib/gem";

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
  args: { size: 96, seed: "alice", className: "rounded-full" },
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
    getValue: (properties: ReturnType<typeof getGemProperties> & { cutVariantName: string }) =>
      properties.cutVariantName,
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
          <HashedGem size={80} seed={name} className="rounded-full" />
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
    className: "rounded-3xl",
    static: true,
  },
  render: ({ seed, size = 144, className, static: isStatic, gemType, cutType }) => {
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
        <HashedGem
          key={size}
          size={size}
          seed="alice"
          className="rounded-full"
        />
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
              className="rounded-full"
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
              className="rounded-full"
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
        <div key={cutType} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                  className="rounded-full"
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
          <HashedGem
            key={seed}
            size={64}
            seed={seed}
            static
            className="rounded-full"
          />
        ))}
      </div>
      <p style={{ fontSize: 12, opacity: 0.5 }}>Animated (default)</p>
      <div style={{ display: "flex", gap: 12 }}>
        {["alice", "bob", "carol", "dave", "eve"].map((seed) => (
          <HashedGem
            key={seed}
            size={64}
            seed={seed}
            className="rounded-full"
          />
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
      "ursula",
      "victor",
      "wendy",
      "xander",
      "yuki",
      "zara",
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
