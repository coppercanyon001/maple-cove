# Maple Cove — Mint Asset Manifest

All visible and audible assets generated with Mint (mint.gg). Generation started 2026-07-16.
Total cost: ≈51,200 top-up credits (≈$36) for 26 final models, 6 animation batches, 7 audio, 1 image.

## Asset packs

| Pack | Asset ID | Chat |
| --- | --- | --- |
| Maple Cove Characters (5 riggable chars) | `th7437wkxk6bjxqdgz3txg1yvn8apet8` | https://mint.gg/chat/ph7dzb9p47k9fawfdfs559j4h58aqect |
| Maple Cove Buildings (6 buildings) | `th7dz7hennf5e3kqcvcw1qm39d8appn2` | https://mint.gg/chat/ph75w1pdnwadfa1zca7zxmwn118ap3q0 |
| Maple Cove Props (12 props) | `th79s2b0g7yrnvvgakfnd16ftd8aqe0b` | https://mint.gg/chat/ph763xkq5bf4mgp0s43sfnsecx8aqwjc |

Character items: Player Kid, Cat Villager, Frog Villager, Duck Villager, Bear Villager (T-pose, empty hands, riggable).
Building items: Player Cottage, Yellow Cottage, Coral Cottage, Island Shop, Museum, Wooden Bridge.
Prop items: Apple Tree, Orange Tree, Cedar Tree, Tulip Patch, Wooden Fence, Mailbox, Conch Shell, Gift Parcel, Signpost, Park Bench, Round Lantern, Stone Well.

## Audio

| Sound | Asset ID | Chat |
| --- | --- | --- |
| Maple Cove BGM (60s loop) | `xd74cwwmtchv8kg9wgn1vgy6g98aqe09` | https://mint.gg/chat/ph7ctngg7swzwfz8q0kmakvj5d8ap73r |
| Pickup Pop | `xd790f41pfcm8kan8672mr2b558aqg1c` | https://mint.gg/chat/ph7ej40kb791cfsgrgprpf54fn8aq4qg |
| Villager Babble | `xd78xpcjksmmjs3ajwdxfvm71d8apn5b` | https://mint.gg/chat/ph74tjakadf86x5f1qymg9qw798aqtrg |
| Grass Footsteps | `xd7awtvxyy0e79zsmbthpm5nqx8apemk` | https://mint.gg/chat/ph79drvw1xp50gwfjmr9tntdkx8apd78 |
| Shore Ambience (20s loop) | `xd74vxgmnp0yk6vjrsgassapk18apn5a` | https://mint.gg/chat/ph7c12ge0r9cytdca11sfhsyv18app3e |
| Success Jingle | `xd74ytfrz861cjmqs8eadshhdd8aqvw8` | https://mint.gg/chat/ph74awqje5c4z3svmjz31t03h98aq3za |
| Coin Chime | `xd75sjk9f2yntqk92zvdzwh9y98ap5c3` | https://mint.gg/chat/ph70gr5753adcxh1vks991eeys8ap87v |

## Standalone models & images

| Asset | Asset ID | Chat |
| --- | --- | --- |
| Red Apple (collectible) | `ks74qjh0ff57yxgpfrqp396a0h8aqv2g` | props chat |
| Orange Fruit (collectible) | `ks770zxy04kdqrx9zj03yddmrn8aq2vs` | props chat |
| Maple Cove Title (image) | `xn72vsvbc406a9y4xk897sp09x8aqaqh` | https://mint.gg/chat/ph71t6x9w3331v96xjk4cdmfts8apeke |

Title image ships on a solid background; keyed to alpha locally (PIL corner-sample) → `public/images/maple-cove-title.png`.

## Animation batches (Meshy catalog clips via Mint)

| Character | Batch ID | Clips (action IDs) |
| --- | --- | --- |
| Player Kid | `w573ec5k77pd1nw4z89b9ckgex8aqvb9` | Idle (0), run_fast_3_inplace (659), Carry_Heavy_Object_Walk_inplace (611) |
| Cat Villager | `w570gnzs0r37j1mjdv7c5xfg9s8aqm5t` | Stand_and_Chat (56) |
| Frog Villager v1 | `w5774ych3fg9w7q8y2v1nqt6xh8ap5nt` | FAILED ×2 (`model_animation_provider_rejected` — eyes-on-top head defeats humanoid rig detection) |
| Frog Villager v2 "Mint Stripe Frogling" (model `ks77tsgjhfbaaczy3g4j9wkv418aqtbj`) | `w570njda1768zpdcnrbgg79jyn8aq897` | Listening_Gesture (47) — succeeded |
| Duck Villager | `w5751hrpg4a650w83d2ct1sqfn8apg5s` | Wave_One_Hand (290) |
| Bear Villager | `w57c9zh4xqxpjqhpmzgrw8vtt18apy01` | Agree_Gesture (25) |

## Non-Mint elements (procedural, flagged per playbook)

- Island terrain, beach, river and water planes (procedural three.js geometry — Mint worlds export as splats, not playable meshes)
- Ambient particles: butterflies, falling leaves, gulls, clouds, fireworks (procedural primitives, same approach as prior showcase games)
