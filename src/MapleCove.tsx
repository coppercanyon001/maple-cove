import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { MAPLE_MINT_ASSETS as ASSETS } from "./mapleMintAssets";

type Phase = "loading" | "ready" | "playing" | "celebrating" | "won" | "ended" | "error";
type Direction = "forward" | "back" | "left" | "right";
type ItemType = "apple" | "orange" | "shell" | "parcel";
type RequestChip = { villager: string; type: ItemType; count: number };
type Ui = {
  phase: Phase;
  coins: number;
  carried: ItemType[];
  time: number;
  sound: boolean;
  loading: string;
  toast: string;
  banter: { speaker: string; line: string } | null;
  requests: RequestChip[];
  titleOk: boolean;
};

const DAY_TIME = 170;
const MAX_CARRY = 3;
const FUND_GOAL = 420;
const ITEM_EMOJI: Record<ItemType, string> = { apple: "🍎", orange: "🍊", shell: "🐚", parcel: "🎁" };

const INITIAL_UI: Ui = {
  phase: "loading",
  coins: 0,
  carried: [],
  time: DAY_TIME,
  sound: true,
  loading: "Sailing to Maple Cove…",
  toast: "",
  banter: null,
  requests: [],
  titleOk: true,
};

const VILLAGERS = [
  {
    key: "cat", x: -3.2, z: 5.6, yaw: 2.62,
    chatter: [
      "The plaza smells like fresh apples today!",
      "I reorganized my whole cottage. Twice.",
    ],
    thanks: [
      "Purr-fect! Straight to the festival fund!",
      "You're the best neighbor Maple Cove ever had!",
    ],
  },
  {
    key: "frog", x: 8.6, z: -7.6, yaw: -0.85,
    chatter: [
      "The river sounds extra sparkly this morning.",
      "I only trust bridges I can nap under.",
    ],
    thanks: [
      "Ribbit-riffic! The fund is growing!",
      "Splendid! Tonight's festival will be legendary!",
    ],
  },
  {
    key: "duck", x: 1.5, z: 21, yaw: -3.07,
    chatter: [
      "The tide brought in new shells overnight!",
      "One day I'll sail past those little islands.",
    ],
    thanks: [
      "Quack-tastic! Adding it to the fund!",
      "Shell yeah! The festival is nearly funded!",
    ],
  },
  {
    key: "bear", x: -3.4, z: -11.8, yaw: 0.28,
    chatter: [
      "The shop's shelves are nearly empty — good sign!",
      "Festival lanterns! Fresh from the back room!",
    ],
    thanks: [
      "Wonderful! I'll log it in the festival book!",
      "Maple Cove thanks you, little helper!",
    ],
  },
] as const;

const BUILDING_PLACEMENTS = [
  { key: "playerCottage", x: -9, z: 12, size: 5.8, yaw: 2.5, blocker: 2.0 },
  { key: "yellowCottage", x: -16, z: -7, size: 5.4, yaw: 1.16, blocker: 1.9 },
  { key: "coralCottage", x: 7, z: 14, size: 5.4, yaw: -2.68, blocker: 1.9 },
  { key: "shop", x: -4, z: -14, size: 6.4, yaw: 0.28, blocker: 2.2 },
  { key: "museum", x: 20, z: -7, size: 7.8, yaw: -1.24, blocker: 2.6 },
] as const;

const PROP_PLACEMENTS = [
  { key: "well", x: 0, z: -3, size: 2.6, yaw: 0, blocker: 1.25 },
  { key: "signpost", x: 2.4, z: 0.8, size: 2.0, yaw: -0.4, blocker: 0.5 },
  { key: "bench", x: -2.8, z: -6.2, size: 1.7, yaw: 0.7, blocker: 0.8 },
  { key: "bench", x: 4.6, z: 6.6, size: 1.7, yaw: -2.4, blocker: 0.8 },
  { key: "lantern", x: -3.6, z: -1.8, size: 2.3, yaw: 0, blocker: 0.4 },
  { key: "lantern", x: 3.6, z: -4.6, size: 2.3, yaw: 0, blocker: 0.4 },
  { key: "lantern", x: 9.6, z: -3.4, size: 2.3, yaw: 0, blocker: 0.4 },
  { key: "lantern", x: 16.2, z: 0.6, size: 2.3, yaw: 0, blocker: 0.4 },
  { key: "mailbox", x: -7.2, z: 10.4, size: 1.5, yaw: 2.5, blocker: 0.4 },
  { key: "mailbox", x: 5.6, z: 12.6, size: 1.5, yaw: -2.7, blocker: 0.4 },
  { key: "fence", x: -11.5, z: 8.5, size: 2.2, yaw: 0.6, blocker: 0.9 },
  { key: "fence", x: -13.4, z: 6.5, size: 2.2, yaw: 0.6, blocker: 0.9 },
  { key: "fence", x: -7.9, z: -11.9, size: 2.2, yaw: 0.3, blocker: 0.9 },
  { key: "fence", x: -0.4, z: -16.1, size: 2.2, yaw: -0.2, blocker: 0.9 },
  { key: "tulips", x: -5, z: 8, size: 1.1, yaw: 0.4, blocker: 0 },
  { key: "tulips", x: 6, z: 9.5, size: 1.1, yaw: 1.4, blocker: 0 },
  { key: "tulips", x: -8, z: -6, size: 1.1, yaw: 2.2, blocker: 0 },
  { key: "tulips", x: 2, z: -9, size: 1.1, yaw: -0.8, blocker: 0 },
  { key: "tulips", x: 17.5, z: 4, size: 1.1, yaw: 0.9, blocker: 0 },
  { key: "tulips", x: 21, z: -1.5, size: 1.1, yaw: -1.7, blocker: 0 },
] as const;

const FRUIT_TREES = [
  { kind: "apple" as ItemType, x: -17, z: 3 },
  { kind: "apple" as ItemType, x: -12, z: 17 },
  { kind: "apple" as ItemType, x: -19, z: -13 },
  { kind: "orange" as ItemType, x: 19.5, z: 5.5 },
  { kind: "orange" as ItemType, x: 23.5, z: -2.5 },
  { kind: "orange" as ItemType, x: 17.5, z: 10.5 },
] as const;

const CEDARS = [
  [-22, -2], [-20, 10], [-14, -18], [4, -20], [9, -17], [22, 13], [-14, 19], [25, 7],
] as const;

const SHELL_SPOTS = [
  [-8, 26.2], [0, 27.2], [8, 26.4], [-17, 20.5], [16.5, 20.5],
] as const;

const PARCELS = [
  { x: 24, z: -13, addressee: 0 },
  { x: -6, z: -20, addressee: 2 },
  { x: -23, z: 7, addressee: 1 },
] as const;

// River band and bridge crossing lane (world units).
const RIVER_X0 = 10.4;
const RIVER_X1 = 15.4;
const BRIDGE_Z = -1.5;
const BRIDGE_HALF = 2.3;
const ISLAND_WALK_RADIUS = 28.4;

type DayStop = { u: number; sky: number; sun: number; sunI: number; hemi: number };
const DAY_STOPS: DayStop[] = [
  { u: 0.0, sky: 0xaee8f7, sun: 0xfff3cf, sunI: 2.4, hemi: 2.1 },
  { u: 0.45, sky: 0x9edcf3, sun: 0xffeebb, sunI: 2.8, hemi: 2.3 },
  { u: 0.7, sky: 0xf8cf9e, sun: 0xffc078, sunI: 2.1, hemi: 1.8 },
  { u: 0.88, sky: 0xc793a4, sun: 0xff9a68, sunI: 1.4, hemi: 1.3 },
  { u: 1.0, sky: 0x606e9e, sun: 0x8fa0d0, sunI: 0.75, hemi: 0.9 },
];

export default function MapleCove() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<{ start: () => void; toggleSound: () => void; setDirection: (d: Direction, v: boolean) => void } | null>(null);
  const [ui, setUi] = useState<Ui>(INITIAL_UI);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    let animationFrame = 0;
    let cleanupRuntime: () => void = () => undefined;
    const pressed = { forward: false, back: false, left: false, right: false };
    const timers: number[] = [];
    let banterTimer = 0;
    let toastTimer = 0;

    const audio = Object.fromEntries(
      Object.entries(ASSETS.audio).map(([key, source]) => [key, new Audio(source)]),
    ) as Record<keyof typeof ASSETS.audio, HTMLAudioElement>;
    audio.music.loop = true;
    audio.music.volume = 0.2;
    audio.shore.loop = true;
    audio.shore.volume = 0.16;
    audio.footsteps.loop = true;
    audio.footsteps.volume = 0.32;
    audio.babble.volume = 0.5;
    audio.coin.volume = 0.55;

    void (async () => {
      try {
        if (disposed || !canvasRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xaee8f7);
        scene.fog = new THREE.Fog(0xaee8f7, 95, 260);
        const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 420);
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.06;

        const hemi = new THREE.HemisphereLight(0xfff4d6, 0x3e5a44, 2.1);
        scene.add(hemi);
        const sun = new THREE.DirectionalLight(0xfff3cf, 2.4);
        sun.position.set(-16, 26, 12);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -36;
        sun.shadow.camera.right = 36;
        sun.shadow.camera.top = 36;
        sun.shadow.camera.bottom = -36;
        sun.shadow.camera.far = 90;
        scene.add(sun);

        const manager = new THREE.LoadingManager();
        manager.onProgress = (_url, loaded, total) => {
          if (!disposed) setUi((v) => ({ ...v, loading: `Gathering Mint assets · ${loaded}/${total}` }));
        };
        const loader = new GLTFLoader(manager);
        const allModelPaths = [
          ASSETS.player.model, ASSETS.player.idle, ASSETS.player.run, ASSETS.player.carry,
          ...ASSETS.villagers.flatMap((v) => [v.model, v.animation]),
          ...Object.values(ASSETS.buildings),
          ...Object.values(ASSETS.props),
        ];
        const uniquePaths = [...new Set<string>(allModelPaths)];
        const loaded = await Promise.all(
          uniquePaths.map(async (path) => [path, await loader.loadAsync(path)] as const),
        );
        const gltfs = new Map(loaded);
        if (disposed) return;

        const prepare = (object: THREE.Object3D) => {
          object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.frustumCulled = false;
            }
          });
          return object;
        };
        const fitHeight = (object: THREE.Object3D, height: number) => {
          const root = new THREE.Group();
          root.add(object);
          object.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          object.scale.setScalar(height / Math.max(size.y, 0.001));
          object.updateMatrixWorld(true);
          const fitted = new THREE.Box3().setFromObject(object);
          const center = fitted.getCenter(new THREE.Vector3());
          object.position.set(-center.x, -fitted.min.y, -center.z);
          return prepare(root);
        };
        const fitMax = (object: THREE.Object3D, maxSize: number) => {
          const root = new THREE.Group();
          root.add(object);
          object.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          object.scale.setScalar(maxSize / Math.max(size.x, size.y, size.z, 0.001));
          object.updateMatrixWorld(true);
          const fitted = new THREE.Box3().setFromObject(object);
          const center = fitted.getCenter(new THREE.Vector3());
          object.position.set(-center.x, -fitted.min.y, -center.z);
          return prepare(root);
        };
        const sceneFor = (path: string) => cloneSkeleton(gltfs.get(path)!.scene);
        const disableShadowCast = (object: THREE.Object3D) => {
          object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) child.castShadow = false;
          });
          return object;
        };

        // ---------- Island terrain (procedural — Mint worlds export as splats,
        // not playable meshes; flagged in MINT_ASSET_MANIFEST.md) ----------
        const gameRoot = new THREE.Group();
        scene.add(gameRoot);

        const water = new THREE.Mesh(
          new THREE.CircleGeometry(240, 48),
          new THREE.MeshStandardMaterial({ color: 0x4fa3c9, roughness: 0.35, metalness: 0.05 }),
        );
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.52;
        water.receiveShadow = true;
        gameRoot.add(water);

        const grassGeo = new THREE.CircleGeometry(26, 96);
        {
          const colors: number[] = [];
          const base = new THREE.Color(0x79c06c);
          const alt = new THREE.Color(0x67ae5d);
          const pos = grassGeo.attributes.position;
          for (let i = 0; i < pos.count; i += 1) {
            const n = Math.sin(pos.getX(i) * 0.7) * Math.cos(pos.getY(i) * 0.8);
            const c = base.clone().lerp(alt, (n + 1) / 2);
            colors.push(c.r, c.g, c.b);
          }
          grassGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        }
        const grass = new THREE.Mesh(grassGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
        grass.rotation.x = -Math.PI / 2;
        grass.receiveShadow = true;
        gameRoot.add(grass);

        const beach = new THREE.Mesh(
          new THREE.RingGeometry(25.5, 30, 96),
          new THREE.MeshStandardMaterial({ color: 0xecd9a8, roughness: 1 }),
        );
        beach.rotation.x = -Math.PI / 2;
        beach.position.y = -0.03;
        beach.receiveShadow = true;
        gameRoot.add(beach);

        const plaza = new THREE.Mesh(
          new THREE.CircleGeometry(6.2, 48),
          new THREE.MeshStandardMaterial({ color: 0xd9c391, roughness: 1 }),
        );
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.set(0, 0.012, -1.5);
        plaza.receiveShadow = true;
        gameRoot.add(plaza);

        const river = new THREE.Mesh(
          new THREE.PlaneGeometry(RIVER_X1 - RIVER_X0, 58),
          new THREE.MeshStandardMaterial({ color: 0x58b4d6, roughness: 0.3, transparent: true, opacity: 0.94 }),
        );
        river.rotation.x = -Math.PI / 2;
        river.position.set((RIVER_X0 + RIVER_X1) / 2, 0.024, 0);
        gameRoot.add(river);

        const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
        const foam = new THREE.Mesh(new THREE.RingGeometry(30.1, 30.8, 96), foamMat);
        foam.rotation.x = -Math.PI / 2;
        foam.position.y = -0.4;
        gameRoot.add(foam);

        // Distant islets so the horizon is not empty water.
        for (const [ix, iz, s] of [[-70, -45, 9], [62, -60, 7], [78, 30, 11], [-58, 55, 6]] as const) {
          const islet = new THREE.Group();
          const mound = new THREE.Mesh(
            new THREE.SphereGeometry(s, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x6fae63, roughness: 1 }),
          );
          islet.add(mound);
          islet.position.set(ix, -0.5, iz);
          gameRoot.add(islet);
        }

        // ---------- Mint buildings & props ----------
        type Blocker = { x: number; z: number; radius: number };
        const blockers: Blocker[] = [];
        const contentRoot = new THREE.Group();
        contentRoot.position.y = 0.015;
        gameRoot.add(contentRoot);

        for (const p of BUILDING_PLACEMENTS) {
          const building = fitMax(sceneFor(ASSETS.buildings[p.key as keyof typeof ASSETS.buildings]), p.size);
          building.position.set(p.x, 0, p.z);
          building.rotation.y = p.yaw;
          contentRoot.add(building);
          blockers.push({ x: p.x, z: p.z, radius: p.blocker });
        }
        const bridge = fitMax(sceneFor(ASSETS.buildings.bridge), 7.4);
        bridge.rotation.y = Math.PI / 2;
        bridge.position.set((RIVER_X0 + RIVER_X1) / 2, 0, BRIDGE_Z);
        contentRoot.add(bridge);

        const lanternLights: THREE.PointLight[] = [];
        for (const p of PROP_PLACEMENTS) {
          const prop = fitMax(sceneFor(ASSETS.props[p.key as keyof typeof ASSETS.props]), p.size);
          prop.position.set(p.x, 0, p.z);
          prop.rotation.y = p.yaw;
          contentRoot.add(prop);
          if (p.blocker > 0) blockers.push({ x: p.x, z: p.z, radius: p.blocker });
          if (p.key === "lantern") {
            const light = new THREE.PointLight(0xffc46e, 0, 9, 2);
            light.position.set(p.x, 2.1, p.z);
            contentRoot.add(light);
            lanternLights.push(light);
          }
        }

        type FruitTree = { root: THREE.Object3D; kind: ItemType; x: number; z: number; stock: number; restockAt: number; shakeT: number };
        const fruitTrees: FruitTree[] = [];
        for (const t of FRUIT_TREES) {
          const path = t.kind === "apple" ? ASSETS.props.appleTree : ASSETS.props.orangeTree;
          const tree = fitHeight(sceneFor(path), 4.4);
          tree.position.set(t.x, 0, t.z);
          tree.rotation.y = Math.random() * Math.PI * 2;
          contentRoot.add(tree);
          blockers.push({ x: t.x, z: t.z, radius: 0.85 });
          fruitTrees.push({ root: tree, kind: t.kind, x: t.x, z: t.z, stock: 2, restockAt: 0, shakeT: 0 });
        }
        for (const [cx, cz] of CEDARS) {
          const cedar = fitHeight(sceneFor(ASSETS.props.cedarTree), 5);
          cedar.position.set(cx, 0, cz);
          cedar.rotation.y = Math.random() * Math.PI * 2;
          contentRoot.add(cedar);
          blockers.push({ x: cx, z: cz, radius: 0.9 });
        }

        // ---------- Player ----------
        const playerRoot = new THREE.Group();
        const playerModel = fitHeight(sceneFor(ASSETS.player.model), 1.25);
        playerRoot.add(playerModel);
        playerRoot.position.set(0, 0, 5);
        playerRoot.rotation.y = Math.PI;
        contentRoot.add(playerRoot);

        let leftHand: THREE.Bone | null = null;
        let rightHand: THREE.Bone | null = null;
        playerModel.traverse((child) => {
          if (!(child as THREE.Bone).isBone) return;
          if (child.name === "LeftHand") leftHand = child as THREE.Bone;
          if (child.name === "RightHand") rightHand = child as THREE.Bone;
        });
        if (!leftHand || !rightHand) throw new Error("Mint player rig is missing hand bones.");
        const leftHandBone: THREE.Bone = leftHand;
        const rightHandBone: THREE.Bone = rightHand;

        const playerMixer = new THREE.AnimationMixer(playerModel);
        const idleAction = playerMixer.clipAction(gltfs.get(ASSETS.player.idle)!.animations[0]);
        const runAction = playerMixer.clipAction(gltfs.get(ASSETS.player.run)!.animations[0]);
        const carryAction = playerMixer.clipAction(gltfs.get(ASSETS.player.carry)!.animations[0]);
        carryAction.setLoop(THREE.LoopRepeat, Infinity);
        idleAction.play();
        let playerAction = idleAction;
        const setPlayerAction = (next: THREE.AnimationAction) => {
          if (playerAction === next) return;
          next.reset().fadeIn(0.16).play();
          playerAction.fadeOut(0.16);
          playerAction = next;
        };
        const mixers: THREE.AnimationMixer[] = [playerMixer];

        // ---------- Villagers ----------
        type VillagerRuntime = {
          root: THREE.Object3D;
          data: (typeof VILLAGERS)[number];
          name: string;
          bubble: THREE.Group;
          bubbleItem: THREE.Object3D | null;
          request: { type: ItemType; count: number; createdAt: number } | null;
          nextRequestAt: number;
          bounceT: number;
          chatterAt: number;
        };
        const villagerRuntimes: VillagerRuntime[] = [];
        ASSETS.villagers.forEach((asset, index) => {
          const data = VILLAGERS[index];
          const root = fitHeight(sceneFor(asset.model), 1.12);
          root.position.set(data.x, 0, data.z);
          root.rotation.y = data.yaw;
          contentRoot.add(root);
          blockers.push({ x: data.x, z: data.z, radius: 0.7 });
          const mixer = new THREE.AnimationMixer(root);
          const clip = gltfs.get(asset.animation)!.animations[0];
          const action = mixer.clipAction(clip);
          action.time = Math.random() * Math.max(clip.duration, 0.1);
          action.play();
          mixers.push(mixer);
          const bubble = new THREE.Group();
          bubble.position.set(data.x, 2.05, data.z);
          contentRoot.add(bubble);
          villagerRuntimes.push({
            root, data, name: asset.name, bubble, bubbleItem: null,
            request: null, nextRequestAt: 0, bounceT: 0, chatterAt: 0,
          });
        });

        // ---------- Collectible item templates & ground items ----------
        const templates: Record<ItemType, THREE.Object3D> = {
          apple: fitMax(sceneFor(ASSETS.props.apple), 0.42),
          orange: fitMax(sceneFor(ASSETS.props.orange), 0.42),
          shell: fitMax(sceneFor(ASSETS.props.shell), 0.5),
          parcel: fitMax(sceneFor(ASSETS.props.parcel), 0.55),
        };

        type GroundItem = {
          obj: THREE.Object3D; type: ItemType; state: "drop" | "idle";
          t: number; from: THREE.Vector3; to: THREE.Vector3;
          offset: number; addressee?: number; shellSpot?: number;
        };
        const itemRoot = new THREE.Group();
        contentRoot.add(itemRoot);
        let groundItems: GroundItem[] = [];
        const spawnItem = (type: ItemType, x: number, z: number, extra: Partial<GroundItem> = {}) => {
          const obj = templates[type].clone(true);
          obj.position.set(x, 0.03, z);
          itemRoot.add(obj);
          const item: GroundItem = {
            obj, type, state: "idle", t: 0,
            from: new THREE.Vector3(), to: new THREE.Vector3(x, 0.03, z),
            offset: Math.random() * Math.PI * 2, ...extra,
          };
          groundItems.push(item);
          return item;
        };
        const dropItem = (type: ItemType, fromX: number, fromZ: number, toX: number, toZ: number) => {
          const item = spawnItem(type, fromX, fromZ);
          item.state = "drop";
          item.from.set(fromX, 2.6, fromZ);
          item.to.set(toX, 0.03, toZ);
          item.obj.position.copy(item.from);
        };

        type ShellSpot = { x: number; z: number; respawnAt: number; filled: boolean };
        const shellSpots: ShellSpot[] = SHELL_SPOTS.map(([x, z]) => ({ x, z, respawnAt: 0, filled: false }));

        // ---------- Carried items ----------
        const carriedRoot = new THREE.Group();
        contentRoot.add(carriedRoot);
        let carried: ItemType[] = [];
        let carriedParcelAddressee: number | null = null;
        const refreshCarried = () => {
          while (carriedRoot.children.length) carriedRoot.remove(carriedRoot.children[0]);
          carried.forEach((type) => {
            const item = templates[type].clone(true);
            disableShadowCast(item);
            carriedRoot.add(item);
          });
        };

        // ---------- Ambient life (procedural particles, flagged in manifest) ----------
        const butterflyRoot = new THREE.Group();
        contentRoot.add(butterflyRoot);
        type Flutter = { group: THREE.Group; wings: THREE.Mesh[]; anchor: THREE.Vector3; speed: number; phase: number; radius: number };
        const butterflies: Flutter[] = [];
        const tulipSpots = PROP_PLACEMENTS.filter((p) => p.key === "tulips");
        for (let i = 0; i < 6; i += 1) {
          const group = new THREE.Group();
          const wingGeo = new THREE.PlaneGeometry(0.14, 0.11);
          const wingMat = new THREE.MeshBasicMaterial({
            color: i % 2 ? 0xf28d77 : 0xf4c542, side: THREE.DoubleSide, transparent: true, opacity: 0.95,
          });
          const w1 = new THREE.Mesh(wingGeo, wingMat);
          const w2 = new THREE.Mesh(wingGeo, wingMat);
          w1.position.x = -0.07;
          w2.position.x = 0.07;
          group.add(w1, w2);
          butterflyRoot.add(group);
          const spot = tulipSpots[i % tulipSpots.length];
          butterflies.push({
            group, wings: [w1, w2],
            anchor: new THREE.Vector3(spot.x, 0.75, spot.z),
            speed: 0.5 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2, radius: 0.7 + Math.random() * 0.7,
          });
        }

        type Leaf = { mesh: THREE.Mesh; tree: FruitTree; y: number; sway: number; speed: number };
        const leaves: Leaf[] = [];
        const leafGeo = new THREE.PlaneGeometry(0.1, 0.1);
        for (let i = 0; i < 14; i += 1) {
          const mesh = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({
            color: i % 3 ? 0x86c46f : 0xd8a24e, side: THREE.DoubleSide, transparent: true, opacity: 0.9,
          }));
          contentRoot.add(mesh);
          const tree = fruitTrees[i % fruitTrees.length];
          leaves.push({ mesh, tree, y: Math.random() * 3.4, sway: Math.random() * Math.PI * 2, speed: 0.35 + Math.random() * 0.3 });
        }

        type Gull = { group: THREE.Group; wings: THREE.Mesh[]; radius: number; height: number; speed: number; phase: number };
        const gulls: Gull[] = [];
        for (let i = 0; i < 3; i += 1) {
          const group = new THREE.Group();
          const wingGeo = new THREE.PlaneGeometry(0.7, 0.22);
          const wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const w1 = new THREE.Mesh(wingGeo, wingMat);
          const w2 = new THREE.Mesh(wingGeo, wingMat);
          w1.position.x = -0.34;
          w2.position.x = 0.34;
          group.add(w1, w2);
          scene.add(group);
          gulls.push({ group, wings: [w1, w2], radius: 32 + i * 4, height: 13 + i * 2, speed: 0.1 + i * 0.03, phase: i * 2.1 });
        }

        const clouds: THREE.Group[] = [];
        for (let i = 0; i < 6; i += 1) {
          const group = new THREE.Group();
          const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
          for (let j = 0; j < 3; j += 1) {
            const puff = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random() * 1.4, 12, 10), mat);
            puff.scale.y = 0.4;
            puff.position.set(j * 1.9 - 1.9, Math.random() * 0.4, Math.random() * 1.2);
            group.add(puff);
          }
          group.position.set(Math.random() * 120 - 60, 22 + Math.random() * 5, Math.random() * 120 - 60);
          scene.add(group);
          clouds.push(group);
        }

        type Firework = { points: THREE.Points; velocities: Float32Array; life: number };
        const fireworks: Firework[] = [];
        const spawnFirework = () => {
          const count = 130;
          const positions = new Float32Array(count * 3);
          const velocities = new Float32Array(count * 3);
          const cx = Math.random() * 20 - 10;
          const cy = 8 + Math.random() * 5;
          const cz = Math.random() * 16 - 10;
          for (let i = 0; i < count; i += 1) {
            positions[i * 3] = cx;
            positions[i * 3 + 1] = cy;
            positions[i * 3 + 2] = cz;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = 3.2 + Math.random() * 2.6;
            velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i * 3 + 1] = Math.cos(phi) * speed;
            velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          const colorsPick = [0xf28d77, 0xf4c542, 0x6fbf73, 0x9ad0f0, 0xd88fd0];
          const mat = new THREE.PointsMaterial({
            color: colorsPick[Math.floor(Math.random() * colorsPick.length)],
            size: 0.5, transparent: true, opacity: 1,
          });
          const points = new THREE.Points(geo, mat);
          scene.add(points);
          fireworks.push({ points, velocities, life: 1.6 });
        };

        // ---------- Game state ----------
        let phase: Phase = "ready";
        let running = false;
        let coins = 0;
        let time = DAY_TIME;
        let soundOn = true;
        let elapsed = 0;
        let lastUiPush = 0;
        let celebrationEnd = 0;
        let nextFireworkAt = 0;

        const requestChips = (): RequestChip[] =>
          villagerRuntimes
            .filter((v) => v.request)
            .map((v) => ({ villager: v.name, type: v.request!.type, count: v.request!.count }));

        const pushUi = (extra: Partial<Ui> = {}) => {
          if (disposed) return;
          setUi((value) => ({
            ...value,
            phase, coins, carried: [...carried], time, sound: soundOn,
            loading: "Mint assets ready", requests: requestChips(), ...extra,
          }));
        };
        const play = (key: keyof typeof audio, restart = true) => {
          if (!soundOn) return;
          if (restart) audio[key].currentTime = 0;
          void audio[key].play().catch(() => undefined);
        };
        const toast = (message: string) => {
          window.clearTimeout(toastTimer);
          pushUi({ toast: message });
          toastTimer = window.setTimeout(() => pushUi({ toast: "" }), 2000);
          timers.push(toastTimer);
        };
        const banter = (speaker: string, line: string) => {
          window.clearTimeout(banterTimer);
          pushUi({ banter: { speaker, line } });
          banterTimer = window.setTimeout(() => pushUi({ banter: null }), 3200);
          timers.push(banterTimer);
          play("babble");
        };

        const setBubble = (v: VillagerRuntime) => {
          while (v.bubble.children.length) v.bubble.remove(v.bubble.children[0]);
          v.bubbleItem = null;
          if (!v.request) return;
          const holder = new THREE.Group();
          for (let i = 0; i < v.request.count; i += 1) {
            const mini = templates[v.request.type].clone(true);
            disableShadowCast(mini);
            mini.scale.multiplyScalar(0.72);
            mini.position.x = (i - (v.request.count - 1) / 2) * 0.42;
            holder.add(mini);
          }
          v.bubble.add(holder);
          v.bubbleItem = holder;
        };
        const giveRequest = (v: VillagerRuntime, type: ItemType, count: number) => {
          v.request = { type, count, createdAt: elapsed };
          setBubble(v);
        };
        const randomRequest = (v: VillagerRuntime) => {
          const roll = Math.random();
          const type: ItemType = roll < 0.4 ? "apple" : roll < 0.72 ? "shell" : "orange";
          giveRequest(v, type, type === "orange" ? 1 : Math.random() < 0.45 ? 2 : 1);
        };

        const resetWorld = () => {
          groundItems.forEach((item) => itemRoot.remove(item.obj));
          groundItems = [];
          carried = [];
          carriedParcelAddressee = null;
          refreshCarried();
          shellSpots.forEach((spot) => {
            spawnItem("shell", spot.x, spot.z, { shellSpot: shellSpots.indexOf(spot) });
            spot.filled = true;
          });
          PARCELS.forEach((p) => spawnItem("parcel", p.x, p.z, { addressee: p.addressee }));
          fruitTrees.forEach((tree) => {
            tree.stock = 2;
            tree.restockAt = 0;
            tree.shakeT = 0;
          });
          villagerRuntimes.forEach((v, i) => {
            v.request = null;
            v.nextRequestAt = 0;
            v.bounceT = 0;
            setBubble(v);
            void i;
          });
          giveRequest(villagerRuntimes[0], "apple", 2);
          giveRequest(villagerRuntimes[2], "shell", 1);
          giveRequest(villagerRuntimes[1], "orange", 1);
          villagerRuntimes[3].nextRequestAt = 24;
          fireworks.forEach((f) => scene.remove(f.points));
          fireworks.length = 0;
        };

        const begin = () => {
          phase = "playing";
          running = true;
          coins = 0;
          time = DAY_TIME;
          elapsed = 0;
          playerRoot.position.set(0, 0, 5);
          playerRoot.rotation.y = Math.PI;
          resetWorld();
          audio.music.currentTime = 0;
          play("music", false);
          play("shore", false);
          toast("Fill the festival fund before sundown!");
          pushUi();
        };

        const collect = (item: GroundItem) => {
          if (!running || carried.length >= MAX_CARRY) return false;
          carried.push(item.type);
          if (item.type === "parcel" && item.addressee !== undefined) {
            carriedParcelAddressee = item.addressee;
            toast(`A lost parcel — it's addressed to ${villagerRuntimes[item.addressee].name}!`);
          } else {
            toast(`${ITEM_EMOJI[item.type]} picked up · ${carried.length}/${MAX_CARRY} in hands`);
          }
          if (item.shellSpot !== undefined) {
            shellSpots[item.shellSpot].filled = false;
            shellSpots[item.shellSpot].respawnAt = elapsed + 22;
          }
          itemRoot.remove(item.obj);
          groundItems = groundItems.filter((g) => g !== item);
          refreshCarried();
          play("pickup");
          pushUi();
          return true;
        };

        const reachGoal = () => {
          phase = "celebrating";
          running = false;
          celebrationEnd = elapsed + 5;
          nextFireworkAt = 0;
          play("jingle");
          toast("THE FESTIVAL FUND IS FULL! FIREWORKS OVER MAPLE COVE!");
          pushUi();
        };

        const deliverTo = (v: VillagerRuntime) => {
          if (!running) return;
          // Parcels first: they beat regular requests when the addressee is near.
          const vIndex = villagerRuntimes.indexOf(v);
          if (carriedParcelAddressee === vIndex && carried.includes("parcel")) {
            carried.splice(carried.indexOf("parcel"), 1);
            carriedParcelAddressee = carried.includes("parcel") ? carriedParcelAddressee : null;
            coins += 80;
            v.bounceT = 0.5;
            refreshCarried();
            play("coin");
            play("jingle");
            banter(v.name, v.data.thanks[Math.floor(Math.random() * v.data.thanks.length)]);
            toast("Lost parcel delivered · +80 coins!");
            if (coins >= FUND_GOAL) reachGoal();
            pushUi();
            return;
          }
          if (!v.request) return;
          const type = v.request.type;
          let delivered = 0;
          while (v.request.count > 0 && carried.includes(type)) {
            carried.splice(carried.indexOf(type), 1);
            v.request.count -= 1;
            delivered += 1;
          }
          if (!delivered) return;
          const quick = elapsed - v.request.createdAt < 20 ? 30 : 0;
          coins += delivered * 60 + (v.request.count === 0 ? quick : 0);
          v.bounceT = 0.5;
          refreshCarried();
          play("coin");
          if (v.request.count === 0) {
            v.request = null;
            v.nextRequestAt = elapsed + 7;
            setBubble(v);
            play("jingle");
            banter(v.name, v.data.thanks[Math.floor(Math.random() * v.data.thanks.length)]);
            toast(quick ? `Wish granted fast · +${delivered * 60 + quick} coins!` : `Wish granted · +${delivered * 60} coins!`);
          } else {
            setBubble(v);
            toast(`${delivered} delivered · ${v.request.count} more ${ITEM_EMOJI[type]} to go`);
          }
          if (coins >= FUND_GOAL) reachGoal();
          pushUi();
        };

        if (new URLSearchParams(location.search).has("qa")) {
          (window as unknown as Record<string, unknown>).__mc = {
            player: playerRoot,
            pressed,
            villagers: villagerRuntimes,
            state: () => ({ phase, running, coins, time, carried: [...carried] }),
          };
        }
        controllerRef.current = {
          start: begin,
          toggleSound: () => {
            soundOn = !soundOn;
            if (!soundOn) Object.values(audio).forEach((a) => a.pause());
            else if (running) {
              play("music", false);
              play("shore", false);
            }
            pushUi();
          },
          setDirection: (direction, value) => { pressed[direction] = value; },
        };

        const keyMap: Record<string, Direction> = {
          w: "forward", arrowup: "forward",
          s: "back", arrowdown: "back",
          a: "left", arrowleft: "left",
          d: "right", arrowright: "right",
        };
        const onKey = (event: KeyboardEvent, down: boolean) => {
          const qa = new URLSearchParams(location.search).has("qa");
          const key = event.key.toLowerCase();
          if (down && qa && key === "q") {
            // Grab whatever the nearest open request needs.
            const wanting = villagerRuntimes.find((v) => v.request);
            if (wanting?.request) {
              const need = wanting.request.type;
              while (carried.length < MAX_CARRY && carried.filter((c) => c === need).length < wanting.request.count) carried.push(need);
              refreshCarried();
              pushUi();
            }
            return;
          }
          if (down && qa && key === "e") {
            let nearest: VillagerRuntime | null = null;
            let best = Infinity;
            villagerRuntimes.forEach((v) => {
              const d = Math.hypot(v.data.x - playerRoot.position.x, v.data.z - playerRoot.position.z);
              if (d < best) { best = d; nearest = v; }
            });
            if (nearest) deliverTo(nearest);
            return;
          }
          if (down && qa && key === "f") { time = 12; return; }
          if (down && qa && key === "t") { time = 0.05; return; }
          if (down && qa && key === "g") { playerRoot.position.set(18, 0, 2); return; }
          if (down && qa && key === "y") { coins += 200; if (coins >= FUND_GOAL) reachGoal(); pushUi(); return; }
          const direction = keyMap[key];
          if (!direction) return;
          event.preventDefault();
          pressed[direction] = down;
        };
        const keydown = (event: KeyboardEvent) => onKey(event, true);
        const keyup = (event: KeyboardEvent) => onKey(event, false);
        const release = () => (Object.keys(pressed) as Direction[]).forEach((k) => { pressed[k] = false; });
        window.addEventListener("keydown", keydown, { passive: false });
        window.addEventListener("keyup", keyup, { passive: false });
        window.addEventListener("blur", release);
        window.addEventListener("pointerup", release);

        const resize = () => {
          if (!canvasRef.current) return;
          const width = canvasRef.current.clientWidth;
          const height = canvasRef.current.clientHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvasRef.current);
        resize();
        phase = "ready";
        pushUi();

        const blocked = (x: number, z: number) => {
          if (Math.hypot(x, z) > ISLAND_WALK_RADIUS) return true;
          if (x > RIVER_X0 && x < RIVER_X1 && Math.abs(z - BRIDGE_Z) > BRIDGE_HALF) return true;
          return blockers.some((b) => Math.hypot(x - b.x, z - b.z) < b.radius + 0.42);
        };

        // ---------- Main loop ----------
        let last = performance.now();
        const move = new THREE.Vector3();
        const desiredCamera = new THREE.Vector3();
        const cameraTarget = new THREE.Vector3();
        const leftHandWorld = new THREE.Vector3();
        const rightHandWorld = new THREE.Vector3();
        const handMid = new THREE.Vector3();
        const skyColor = new THREE.Color();
        const sunColor = new THREE.Color();
        const colorA = new THREE.Color();
        const colorB = new THREE.Color();
        camera.position.set(0, 6.6, 15);

        const dayLerp = (u: number) => {
          let a = DAY_STOPS[0];
          let b = DAY_STOPS[DAY_STOPS.length - 1];
          for (let i = 0; i < DAY_STOPS.length - 1; i += 1) {
            if (u >= DAY_STOPS[i].u && u <= DAY_STOPS[i + 1].u) {
              a = DAY_STOPS[i];
              b = DAY_STOPS[i + 1];
              break;
            }
          }
          const span = Math.max(b.u - a.u, 0.0001);
          const k = THREE.MathUtils.clamp((u - a.u) / span, 0, 1);
          skyColor.copy(colorA.setHex(a.sky)).lerp(colorB.setHex(b.sky), k);
          sunColor.copy(colorA.setHex(a.sun)).lerp(colorB.setHex(b.sun), k);
          return {
            sunI: THREE.MathUtils.lerp(a.sunI, b.sunI, k),
            hemiI: THREE.MathUtils.lerp(a.hemi, b.hemi, k),
          };
        };

        const render = (now: number) => {
          if (disposed) return;
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          elapsed += dt;

          // Day-night progression drives sky, sun, fog, and lanterns.
          const dayU = THREE.MathUtils.clamp(1 - time / DAY_TIME, 0, 1);
          const light = dayLerp(dayU);
          (scene.background as THREE.Color).copy(skyColor);
          scene.fog!.color.copy(skyColor);
          sun.color.copy(sunColor);
          sun.intensity = light.sunI;
          hemi.intensity = light.hemiI;
          sun.position.set(
            THREE.MathUtils.lerp(-16, 15, dayU),
            THREE.MathUtils.lerp(26, 12, dayU),
            THREE.MathUtils.lerp(12, -4, dayU),
          );
          // Physical decay (d²) means pools of light need high candela to read.
          const lanternGlow = Math.max(0, (dayU - 0.68) / 0.32) * 22;
          lanternLights.forEach((l) => { l.intensity = lanternGlow; });

          playerRoot.position.y = 0;
          const dx = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0);
          const dz = (pressed.back ? 1 : 0) - (pressed.forward ? 1 : 0);
          const moving = running && Boolean(dx || dz);
          if (moving) {
            move.set(dx, 0, dz).normalize();
            const speed = 5.4;
            const nx = playerRoot.position.x + move.x * speed * dt;
            const nz = playerRoot.position.z + move.z * speed * dt;
            if (!blocked(nx, playerRoot.position.z)) playerRoot.position.x = nx;
            if (!blocked(playerRoot.position.x, nz)) playerRoot.position.z = nz;
            // Mint characters face local +Z; this yaw keeps W pointing north.
            const targetYaw = Math.atan2(move.x, move.z);
            playerRoot.rotation.y = THREE.MathUtils.lerp(playerRoot.rotation.y, targetYaw, Math.min(1, dt * 11));
          }
          if (soundOn && moving && audio.footsteps.paused) void audio.footsteps.play().catch(() => undefined);
          if ((!moving || !soundOn) && !audio.footsteps.paused) audio.footsteps.pause();

          if (carried.length > 0) {
            carryAction.timeScale = moving ? 1.6 : 0;
            setPlayerAction(carryAction);
          } else if (moving) setPlayerAction(runAction);
          else setPlayerAction(idleAction);
          mixers.forEach((mixer) => mixer.update(dt));

          // Carried stack rides at the hand midpoint (front carry pose).
          if (carried.length > 0) {
            playerRoot.updateMatrixWorld(true);
            leftHandBone.getWorldPosition(leftHandWorld);
            rightHandBone.getWorldPosition(rightHandWorld);
            handMid.addVectors(leftHandWorld, rightHandWorld).multiplyScalar(0.5);
            contentRoot.worldToLocal(handMid);
            carriedRoot.children.forEach((item, index) => {
              item.position.set(handMid.x, handMid.y + 0.05 + index * 0.32, handMid.z);
              item.quaternion.copy(playerRoot.quaternion);
            });
          }

          // Fruit trees: shake on contact, drop fruit, restock over time.
          fruitTrees.forEach((tree) => {
            if (tree.shakeT > 0) {
              tree.shakeT = Math.max(0, tree.shakeT - dt);
              tree.root.rotation.z = Math.sin(tree.shakeT * 26) * 0.07 * (tree.shakeT / 0.6);
            }
            if (tree.stock === 0 && tree.restockAt > 0 && elapsed >= tree.restockAt) {
              tree.stock = 2;
              tree.restockAt = 0;
            }
            if (!running || tree.stock === 0 || tree.shakeT > 0) return;
            const d = Math.hypot(tree.x - playerRoot.position.x, tree.z - playerRoot.position.z);
            if (d < 1.7) {
              tree.shakeT = 0.6;
              const drops = tree.stock;
              tree.stock = 0;
              tree.restockAt = elapsed + 26;
              for (let i = 0; i < drops; i += 1) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 1.5 + Math.random() * 0.7;
                dropItem(tree.kind, tree.x, tree.z, tree.x + Math.cos(angle) * radius, tree.z + Math.sin(angle) * radius);
              }
              toast(`${ITEM_EMOJI[tree.kind]} The tree shook loose some fruit!`);
            }
          });

          // Shell respawns keep the beach loop going.
          shellSpots.forEach((spot, index) => {
            if (!spot.filled && spot.respawnAt > 0 && elapsed >= spot.respawnAt) {
              spot.filled = true;
              spot.respawnAt = 0;
              spawnItem("shell", spot.x, spot.z, { shellSpot: index });
            }
          });

          // Ground items: drop arcs, idle bobbing, pickup.
          groundItems.forEach((item) => {
            if (item.state === "drop") {
              item.t = Math.min(1, item.t + dt / 0.55);
              item.obj.position.lerpVectors(item.from, item.to, item.t);
              item.obj.position.y += Math.sin(item.t * Math.PI) * 0.9;
              if (item.t >= 1) item.state = "idle";
              return;
            }
            item.obj.rotation.y += dt * 0.9;
            item.obj.position.y = item.to.y + Math.sin(elapsed * 2.4 + item.offset) * 0.03 + 0.02;
            if (!running) return;
            const d = Math.hypot(item.obj.position.x - playerRoot.position.x, item.obj.position.z - playerRoot.position.z);
            if (d < 1.05) collect(item);
          });

          // Villagers: bubbles bob, deliveries, idle chatter, request refills.
          villagerRuntimes.forEach((v) => {
            v.bubble.position.y = 2.05 + Math.sin(elapsed * 2.4 + v.data.x) * 0.07;
            if (v.bubbleItem) v.bubbleItem.rotation.y += dt * 1.4;
            if (v.bounceT > 0) {
              v.bounceT = Math.max(0, v.bounceT - dt);
              const s = 1 + Math.sin((1 - v.bounceT / 0.5) * Math.PI) * 0.12;
              v.root.scale.setScalar(s);
            }
            if (!running) return;
            if (!v.request && v.nextRequestAt > 0 && elapsed >= v.nextRequestAt) {
              v.nextRequestAt = 0;
              randomRequest(v);
              pushUi();
            }
            const d = Math.hypot(v.data.x - playerRoot.position.x, v.data.z - playerRoot.position.z);
            if (d < 1.9) {
              deliverTo(v);
              if (elapsed - v.chatterAt > 9 && !ui.banter) {
                v.chatterAt = elapsed;
                banter(v.name, v.data.chatter[Math.floor(Math.random() * v.data.chatter.length)]);
              }
            }
          });

          // Ambient life.
          butterflies.forEach((b) => {
            const a = elapsed * b.speed + b.phase;
            b.group.position.set(
              b.anchor.x + Math.cos(a) * b.radius,
              b.anchor.y + Math.sin(elapsed * 2 + b.phase) * 0.18,
              b.anchor.z + Math.sin(a) * b.radius,
            );
            b.group.rotation.y = -a;
            const flap = Math.sin(elapsed * 14 + b.phase) * 0.7;
            b.wings[0].rotation.y = flap;
            b.wings[1].rotation.y = -flap;
          });
          leaves.forEach((leaf) => {
            leaf.y -= dt * leaf.speed;
            if (leaf.y <= 0.05) leaf.y = 2.6 + Math.random() * 1.2;
            leaf.sway += dt * 1.8;
            leaf.mesh.position.set(
              leaf.tree.x + Math.sin(leaf.sway) * 0.9,
              leaf.y,
              leaf.tree.z + Math.cos(leaf.sway * 0.8) * 0.9,
            );
            leaf.mesh.rotation.set(leaf.sway, leaf.sway * 1.3, 0);
          });
          gulls.forEach((gull) => {
            const a = elapsed * gull.speed + gull.phase;
            gull.group.position.set(Math.cos(a) * gull.radius, gull.height + Math.sin(elapsed * 0.7 + gull.phase) * 0.8, Math.sin(a) * gull.radius);
            gull.group.rotation.y = -a - Math.PI / 2;
            const flap = Math.sin(elapsed * 6 + gull.phase) * 0.5;
            gull.wings[0].rotation.z = flap;
            gull.wings[1].rotation.z = -flap;
          });
          clouds.forEach((cloud) => {
            cloud.position.x += dt * 0.5;
            if (cloud.position.x > 70) cloud.position.x = -70;
          });
          foamMat.opacity = 0.24 + Math.sin(elapsed * 1.3) * 0.12;
          foam.scale.setScalar(1 + Math.sin(elapsed * 1.3) * 0.004);

          // Fireworks during the celebration and on the win screen.
          if (phase === "celebrating" || phase === "won") {
            if (elapsed >= nextFireworkAt) {
              spawnFirework();
              nextFireworkAt = elapsed + 0.5 + Math.random() * 0.4;
            }
            if (phase === "celebrating" && elapsed >= celebrationEnd) {
              phase = "won";
              pushUi({ toast: "" });
            }
          }
          for (let i = fireworks.length - 1; i >= 0; i -= 1) {
            const fw = fireworks[i];
            fw.life -= dt;
            const positions = fw.points.geometry.attributes.position as THREE.BufferAttribute;
            for (let j = 0; j < positions.count; j += 1) {
              positions.setXYZ(
                j,
                positions.getX(j) + fw.velocities[j * 3] * dt,
                positions.getY(j) + (fw.velocities[j * 3 + 1] -= 3.4 * dt) * dt,
                positions.getZ(j) + fw.velocities[j * 3 + 2] * dt,
              );
            }
            positions.needsUpdate = true;
            (fw.points.material as THREE.PointsMaterial).opacity = Math.max(0, fw.life / 1.6);
            if (fw.life <= 0) {
              scene.remove(fw.points);
              fw.points.geometry.dispose();
              fireworks.splice(i, 1);
            }
          }

          if (running) {
            time = Math.max(0, time - dt);
            if (time <= 0) {
              running = false;
              phase = "ended";
              audio.music.pause();
              audio.footsteps.pause();
              pushUi({ toast: "" });
            } else if (elapsed - lastUiPush > 0.15) {
              lastUiPush = elapsed;
              pushUi();
            }
          }

          // During the celebration the camera tilts up so the fireworks frame.
          const skyward = phase === "celebrating" || phase === "won";
          desiredCamera.set(playerRoot.position.x, skyward ? 4.6 : 6.6, playerRoot.position.z + (skyward ? 11.5 : 9.6));
          cameraTarget.set(playerRoot.position.x, skyward ? 7.5 : 1.0, playerRoot.position.z - (skyward ? 9 : 2));
          camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt));
          camera.lookAt(cameraTarget);
          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);

        cleanupRuntime = () => {
          observer.disconnect();
          window.removeEventListener("keydown", keydown);
          window.removeEventListener("keyup", keyup);
          window.removeEventListener("blur", release);
          window.removeEventListener("pointerup", release);
          renderer.dispose();
        };
      } catch (error) {
        console.error(error);
        if (!disposed) setUi((value) => ({
          ...value,
          phase: "error",
          loading: "Maple Cove could not open.",
          toast: "A Mint asset failed to load.",
        }));
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(banterTimer);
      window.clearTimeout(toastTimer);
      Object.values(audio).forEach((item) => { item.pause(); item.src = ""; });
      cleanupRuntime();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hold = (direction: Direction, value: boolean) => controllerRef.current?.setDirection(direction, value);
  const modal = ui.phase === "loading" || ui.phase === "ready" || ui.phase === "won" || ui.phase === "ended" || ui.phase === "error";
  const dayU = 1 - ui.time / DAY_TIME;
  const dayLabel = dayU < 0.35 ? "MORNING" : dayU < 0.6 ? "MIDDAY" : dayU < 0.85 ? "GOLDEN HOUR" : "DUSK";
  const title = ui.titleOk
    ? <img src={ASSETS.images.title} alt="Maple Cove" onError={() => setUi((v) => ({ ...v, titleOk: false }))} />
    : <span className="title-fallback">MAPLE COVE</span>;

  return (
    <main className="maple-game">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Maple Cove 3D game" tabIndex={0} />
      <header className="game-header">
        <div>
          {title}
          <div className="mint-credit">BROUGHT TO YOU BY MINT</div>
        </div>
        <div className="header-spacer" />
        <div className="coin-chip"><span className="coin-dot" /><b>{ui.coins}</b><span>/ {FUND_GOAL}</span></div>
        <button onClick={() => controllerRef.current?.toggleSound()}>{ui.sound ? "SOUND ON" : "SOUND OFF"}</button>
      </header>
      {(ui.phase === "playing" || ui.phase === "celebrating") && ui.requests.length > 0 && (
        <div className="request-row">
          {ui.requests.map((request) => (
            <div className="request-chip" key={request.villager}>
              <small>{request.villager} WISHES FOR</small>
              {ITEM_EMOJI[request.type]} ×{request.count}
            </div>
          ))}
        </div>
      )}
      <section className="fund-card">
        <span>FESTIVAL FUND</span>
        <strong>{ui.coins} / {FUND_GOAL} coins</strong>
        <div className="meter"><i style={{ width: `${Math.min(100, (ui.coins / FUND_GOAL) * 100)}%` }} /></div>
      </section>
      <section className="clock-card">
        <span>SUNDOWN AT DUSK</span>
        <strong>{dayLabel}</strong>
        <div className="meter"><i style={{ width: `${Math.max(0, (ui.time / DAY_TIME) * 100)}%` }} /></div>
      </section>
      <div className="carry-row">
        {Array.from({ length: MAX_CARRY }, (_, index) => (
          <div key={index} className={`carry-slot ${ui.carried[index] ? "" : "empty"}`}>
            {ui.carried[index] ? ITEM_EMOJI[ui.carried[index]] : ""}
          </div>
        ))}
      </div>
      {ui.toast && <div className="game-toast">{ui.toast}</div>}
      {ui.banter && <div className="npc-banter"><b>{ui.banter.speaker}</b><span>“{ui.banter.line}”</span></div>}
      <div className="keyboard-hint">
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
        <span>SHAKE TREES · COMB THE BEACH · GRANT WISHES</span>
      </div>
      <div className="touch-controls" aria-label="Touch controls">
        <button onPointerDown={() => hold("forward", true)} onPointerUp={() => hold("forward", false)} aria-label="Move forward">▲</button>
        <div>
          <button onPointerDown={() => hold("left", true)} onPointerUp={() => hold("left", false)} aria-label="Move left">◀</button>
          <button onPointerDown={() => hold("back", true)} onPointerUp={() => hold("back", false)} aria-label="Move backward">▼</button>
          <button onPointerDown={() => hold("right", true)} onPointerUp={() => hold("right", false)} aria-label="Move right">▶</button>
        </div>
      </div>
      {modal && (
        <div className="game-modal">
          <div className="modal-card">
            {title}
            <p className="modal-kicker">AN ORIGINAL MINT-GENERATED ISLAND LIFE GAME</p>
            <p>
              {ui.phase === "loading"
                ? ui.loading
                : ui.phase === "won"
                  ? `The festival fund is full and the fireworks are flying! You raised ${ui.coins} coins for Maple Cove's bridge festival.`
                  : ui.phase === "ended"
                    ? `The stars came out with the fund at ${ui.coins} of ${FUND_GOAL} coins. The villagers voted to try again tomorrow.`
                    : "Tonight is Maple Cove's bridge festival — if the town fund fills in time! Shake fruit trees, comb the beach for shells, return lost parcels, and deliver whatever the villagers wish for before sundown."}
            </p>
            {ui.phase !== "loading" && (
              <button disabled={ui.phase === "error"} onClick={() => controllerRef.current?.start()}>
                {ui.phase === "won" ? "PLAY ANOTHER DAY" : ui.phase === "ended" ? "TRY TOMORROW" : ui.phase === "error" ? "COVE CLOSED" : "START THE DAY"}
              </button>
            )}
            <small>WASD / ARROWS TO MOVE · EVERY VISIBLE AND AUDIBLE ASSET MADE IN MINT</small>
          </div>
        </div>
      )}
    </main>
  );
}
