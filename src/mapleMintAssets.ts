// Every path below is a Mint-generated asset (mint.gg). See MINT_ASSET_MANIFEST.md
// for the generation chats behind each file.
export const MAPLE_MINT_ASSETS = {
  player: {
    model: "models/player-kid-rigged.glb",
    idle: "animations/idle.glb",
    run: "animations/run.glb",
    carry: "animations/carry.glb",
  },
  villagers: [
    { key: "cat", name: "CLEMENTINE", model: "models/cat-villager-rigged.glb", animation: "animations/stand-and-chat.glb" },
    { key: "frog", name: "PUDDLES", model: "models/frog-villager-rigged.glb", animation: "animations/listening-gesture.glb" },
    { key: "duck", name: "SKIPPER", model: "models/duck-villager-rigged.glb", animation: "animations/wave-one-hand.glb" },
    { key: "bear", name: "MAPLE", model: "models/bear-villager-rigged.glb", animation: "animations/agree-gesture.glb" },
  ],
  buildings: {
    playerCottage: "models/player-cottage.glb",
    yellowCottage: "models/yellow-cottage.glb",
    coralCottage: "models/coral-cottage.glb",
    shop: "models/island-shop.glb",
    museum: "models/museum.glb",
    bridge: "models/wooden-bridge.glb",
  },
  props: {
    appleTree: "models/apple-tree.glb",
    orangeTree: "models/orange-tree.glb",
    cedarTree: "models/cedar-tree.glb",
    tulips: "models/tulip-patch.glb",
    fence: "models/wooden-fence.glb",
    mailbox: "models/mailbox.glb",
    shell: "models/conch-shell.glb",
    parcel: "models/gift-parcel.glb",
    signpost: "models/signpost.glb",
    bench: "models/park-bench.glb",
    lantern: "models/round-lantern.glb",
    well: "models/stone-well.glb",
    apple: "models/red-apple.glb",
    orange: "models/orange-fruit.glb",
  },
  images: {
    title: "images/maple-cove-title.png",
  },
  audio: {
    music: "audio/maple-cove-bgm.mp3",
    shore: "audio/shore-ambience.mp3",
    pickup: "audio/pickup-pop.mp3",
    babble: "audio/villager-babble.mp3",
    footsteps: "audio/grass-footsteps.mp3",
    jingle: "audio/success-jingle.mp3",
    coin: "audio/coin-chime.mp3",
  },
} as const;
