// Every path below is a Mint-generated asset (mint.gg). See MINT_ASSET_MANIFEST.md
// for the generation chats behind each file.
//
// Boulder Cove (dino re-theme) note: some internal keys keep their original
// Maple Cove names to avoid churn — "apple" is the red Boulderberry,
// "orange" is the Spikefruit, "parcel" is a lost Dino Egg.
export const MAPLE_MINT_ASSETS = {
  player: {
    model: "models/cave-kid-rigged.glb",
    idle: "animations/idle.glb",
    run: "animations/run.glb",
    carry: "animations/carry.glb",
  },
  villagers: [
    { key: "triceratops", name: "TRIXIE", model: "models/triceratops-villager-rigged.glb", animation: "animations/stand-and-chat.glb" },
    { key: "stegosaurus", name: "SPIKE", model: "models/stegosaurus-villager-rigged.glb", animation: "animations/listening-gesture.glb" },
    { key: "trex", name: "REX", model: "models/trex-villager-rigged.glb", animation: "animations/wave-one-hand.glb" },
    { key: "ankylosaurus", name: "BOULDER", model: "models/ankylosaurus-villager-rigged.glb", animation: "animations/agree-gesture.glb" },
  ],
  buildings: {
    playerCottage: "models/player-boulder-hut.glb",
    yellowCottage: "models/yellow-boulder-hut.glb",
    coralCottage: "models/coral-boulder-hut.glb",
    shop: "models/stone-age-shop.glb",
    museum: "models/bone-museum.glb",
    bridge: "models/bone-bridge.glb",
  },
  props: {
    appleTree: "models/boulderberry-tree.glb",
    orangeTree: "models/spikefruit-tree.glb",
    cedarTree: "models/primeval-conifer.glb",
    giantFern: "models/giant-fern.glb",
    tulips: "models/fern-flower-patch.glb",
    fence: "models/bone-fence.glb",
    mailbox: "models/bone-mailbox.glb",
    shell: "models/ammonite-shell.glb",
    parcel: "models/dino-egg.glb",
    signpost: "models/bone-signpost.glb",
    bench: "models/stone-bench.glb",
    lantern: "models/stone-torch.glb",
    well: "models/hot-spring-well.glb",
    apple: "models/boulderberry.glb",
    orange: "models/spikefruit.glb",
    fishingRod: "models/vine-fishing-rod.glb",
    bugNet: "models/web-bug-net.glb",
    fish: "models/prehistoric-fish.glb",
    dragonfly: "models/giant-dragonfly.glb",
    sapling: "models/fruit-sapling.glb",
  },
  images: {
    title: "images/boulder-cove-title.png",
  },
  audio: {
    music: "audio/boulder-cove-bgm.mp3",
    shore: "audio/shore-ambience.mp3",
    pickup: "audio/pickup-pop.mp3",
    babble: "audio/villager-babble.mp3",
    footsteps: "audio/grass-footsteps.mp3",
    jingle: "audio/success-jingle.mp3",
    coin: "audio/coin-chime.mp3",
    splash: "audio/fishing-splash.mp3",
    swoosh: "audio/net-swoosh.mp3",
  },
} as const;
