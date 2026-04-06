# @m3000/hashed-gems

## 1.0.0

### Major Changes

- 27bbee3: Initial release of @m3000/hashed-gems - a library for generating beautiful, deterministic gem avatars from any string seed.

  **Features:**
  - **HashedGem component** - WebGL-rendered gem avatar using custom shaders
  - **12 gem types** - diamond, ruby, sapphire, emerald, topaz, amethyst, aquamarine, rose-quartz, citrine, onyx, alexandrite, opal
  - **7 cut types** - round-brilliant, princess, cushion, emerald-step, firework, jubilee, rose
  - **16 cut variants** - deterministic sub-variations like starburst, compressed, squarish, elongated, high-crown, and bloom
  - **5 rarity tiers** - common, uncommon, rare, epic, legendary with probability-based distribution
  - **Deterministic caustic intensity** - seed-derived caustic counts with animated WebGL light refraction effects
  - **Static mode** - render single frame for list performance
  - **Custom resolution** - render at higher resolution for exports/screenshots
  - **HashedGemGradient** - SSR-compatible CSS gradient component
  - **Trait helpers and constants** - exported helpers like getGemProperties(), getGemColors(), getCutVariant(), and trait constants/types for programmatic use
  - **React 19 support** - built for React 19 applications
