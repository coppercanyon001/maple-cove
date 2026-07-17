# Maple Cove

An original Animal Crossing–inspired island life game, built as a Mint (mint.gg) product showcase.
Every visible and audible asset — 5 rigged characters, 6 buildings, 14 props, 7 sounds, the title
logo — was generated with Mint. Built with the `build-lucas-3d-games` standard.

## The game

Tonight is Maple Cove's bridge festival — if the town fund fills before sundown. Over one
day–night cycle (~3 minutes) you:

- **Shake fruit trees** (walk into them) to knock loose apples and oranges — trees restock over time
- **Comb the beach** for conch shells — the tide brings new ones
- **Return lost parcels** to their addressees (+80 coins each)
- **Grant villager wishes** — Clementine the cat, Puddles the frog, Skipper the duck, and Maple
  the shopkeeper bear each wish for items (+60/item, +30 quick-delivery bonus)

Carry up to 3 items at once (front-carry pose). Fill the 420-coin festival fund before dusk to
trigger the fireworks celebration; run out of daylight and the town tries again tomorrow.
The orange orchard is across the river — the wooden bridge is the only crossing.

## Run

```sh
export PNPM_HOME=~/Library/pnpm PATH=~/Library/pnpm/bin:$PATH
cd ~/maple-cove
pnpm install
pnpm run dev        # http://localhost:5175
```

WASD / arrows to move; on-screen touch controls also work. Sound toggle top-right.

## QA cheats (append `?qa` to the URL)

- `q` — fill hands with what the nearest open wish needs
- `e` — force-deliver to the nearest villager
- `f` — jump to 12s before sundown (dusk lighting + lanterns)
- `t` — end the day immediately
- `g` — teleport across the river (museum side)
- `y` — +200 coins (two–three presses triggers the win celebration)

## Structure

- `src/MapleCove.tsx` — entire game (scene, day-night cycle, request system, collision, ambient life)
- `src/mapleMintAssets.ts` — mapping of every Mint asset path
- `MINT_ASSET_MANIFEST.md` — generation chats, asset IDs, animation batch IDs, costs
- `public/models|animations|audio|images` — downloaded Mint artifacts

## Handoff notes (per the build standard)

- **All 3D/audio/image assets are Mint-generated.** Procedural exceptions, kept because Mint
  worlds export as gaussian splats which are not playable Three.js terrain: island/beach/river/
  water geometry, plus ambient particles (butterflies, falling leaves, gulls, clouds, fireworks).
- **Frog rig:** the original frog villager model was rejected twice by the animation provider
  (`model_animation_provider_rejected` — eyes-on-top head, no neck landmark). Regenerated as
  "Mint Stripe Frogling" (front-facing eyes, clear neck) which rigged cleanly. Lesson for
  character prompts: keep facial landmarks on the front of the head and give the model a neck.
- **Character clips** are Meshy catalog animations via Mint (`Idle` 0, `run_fast_3_inplace` 659,
  `Carry_Heavy_Object_Walk_inplace` 611, `Stand_and_Chat` 56, `Listening_Gesture` 47,
  `Wave_One_Hand` 290, `Agree_Gesture` 25); bone names retarget across all five Mint rigs.
- **Title image** ships on a solid background even when prompted transparent; keyed to alpha
  locally with a PIL corner-sample threshold.
