import type { Meta, StoryObj } from "@storybook/react";
import { HashedGem } from "@/components/primitives/hashed-gem";

const meta: Meta<typeof HashedGem> = {
  title: "Primitives/HashedGem",
  component: HashedGem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: { type: "range", min: 24, max: 256, step: 8 } },
    seed: { control: "text" },
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

// Use gemType override prop so labels always match regardless of hash
const GEM_TYPES: { gemType: number; label: string }[] = [
  { gemType: 0, label: "Diamond" },
  { gemType: 1, label: "Ruby" },
  { gemType: 2, label: "Sapphire" },
  { gemType: 3, label: "Emerald" },
  { gemType: 4, label: "Topaz" },
  { gemType: 5, label: "Amethyst" },
  { gemType: 6, label: "Aquamarine" },
  { gemType: 7, label: "Rose Quartz" },
  { gemType: 8, label: "Citrine" },
  { gemType: 9, label: "Onyx" },
  { gemType: 10, label: "Alexandrite" },
  { gemType: 11, label: "Opal" },
];

const CUT_TYPES: { cutType: number; label: string }[] = [
  { cutType: 0, label: "Round Brilliant" },
  { cutType: 1, label: "Princess" },
  { cutType: 2, label: "Cushion" },
  { cutType: 3, label: "Emerald Step" },
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
        {GEM_TYPES.map(({ gemType, label }) => (
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
              cutType={0}
              className="rounded-full"
            />
            <span style={{ fontSize: 11, opacity: 0.6 }}>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {CUT_TYPES.map(({ cutType, label }) => (
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
              gemType={0}
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
