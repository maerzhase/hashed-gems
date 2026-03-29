# @m3000/hashed-gems

Generative gem avatars for user identification. Each gem is uniquely rendered based on a seed string (username, address, id) using WebGL shaders with spectral color dispersion.

Built on React 19.

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

<HashedGem seed="vitalik.eth" />
<HashedGem seed="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={128} />
```

## Props

| Prop        | Type      | Default | Description                                                                                                                                               |
| ----------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seed`      | `string`  | `""`    | Any string — username, address, id — hashed to a deterministic avatar                                                                                     |
| `size`      | `number`  | `64`    | Display size in pixels (canvas width & height)                                                                                                            |
| `gemType`   | `number`  | auto    | Override gem type: 0=diamond, 1=ruby, 2=sapphire, 3=emerald, 4=topaz, 5=amethyst, 6=aquamarine, 7=rose-quartz, 8=citrine, 9=onyx, 10=alexandrite, 11=opal |
| `cutType`   | `number`  | auto    | Override cut type: 0=round-brilliant, 1=princess, 2=cushion, 3=emerald-step                                                                               |
| `static`    | `boolean` | `false` | Render a single frame and stop animating. Good for lists                                                                                                  |
| `className` | `string`  | -       | Additional CSS classes                                                                                                                                    |

## License

MIT
