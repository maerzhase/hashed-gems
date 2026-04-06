# @m3000/hashed-gems

Generative gem avatars for user identification. Each gem is uniquely rendered based on a seed string (username, email, id) using WebGL shaders with spectral color dispersion.

Built on React 19.

![Hashed Gems color variations](../../.github/assets/gem-color-variations.png)

## Installation

```bash
pnpm add @m3000/hashed-gems
```

Peer dependencies:

```bash
pnpm add react react-dom
```

## Styles

Import the stylesheet once in your app entry:

```ts
import "@m3000/hashed-gems/styles.css";
```

## Usage

Import the component and use any string as a seed:

```tsx
import { HashedGem } from "@m3000/hashed-gems";

<HashedGem seed="ada.lovelace" />
<HashedGem seed="grace-hopper@example.com" size={128} />
```

## Determinism

The same seed always produces the same gem, so you can use it as a stable visual identity across sessions and devices.

```tsx
<HashedGem seed="ada.lovelace" />
<HashedGem seed="ada.lovelace" />
```

Both renders will resolve to the same gem type, cut, and motion profile.

![Hashed Gems avatar list](../../.github/assets/avatar-list.png)

## Props

| Prop         | Type      | Default    | Description                                                                                                                                               |
| ------------ | --------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seed`       | `string`  | `""`       | Any string — username, email, id — hashed to a deterministic avatar                                                                                       |
| `size`       | `number`  | `64`       | Display size in pixels (container width & height)                                                                                                         |
| `resolution` | `number`  | size × dpr | WebGL canvas pixel resolution. Pass larger value for higher quality captures (e.g. resolution={512} on size={160} for crisp blob image)                   |
| `gemType`    | `GemType` | auto       | Override gem type: `diamond`, `ruby`, `sapphire`, `emerald`, `topaz`, `amethyst`, `aquamarine`, `rose-quartz`, `citrine`, `onyx`, `alexandrite`, or `opal` |
| `cutType`    | `CutType` | auto       | Override cut type: `round-brilliant`, `princess`, `cushion`, `emerald-step`, `firework`, `jubilee`, or `rose`                                            |
| `static`     | `boolean` | `false`    | Render a single frame and stop animating. Good for lists                                                                                                  |
| `className`  | `string`  | -          | Additional CSS classes                                                                                                                                    |

## License

MIT
