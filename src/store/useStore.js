import { create } from 'zustand';
import { galaxies } from '../data/galaxies';

const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));
const clampPitch = (pitch) => Math.max(-0.95, Math.min(0.95, pitch));
const clampDistance = (distance, minDistance, maxDistance) => clampValue(distance, minDistance, maxDistance);
const UNIVERSE_FOCUS_BOUNDS = { x: 60, y: 36, z: 80 };

const clampFocus = (focus = [0, 0, 0], framing = 'universe') => {
  if (!Array.isArray(focus) || focus.length !== 3) {
    return [0, 0, 0];
  }

  if (framing !== 'universe') {
    return focus;
  }

  return [
    clampValue(focus[0], -UNIVERSE_FOCUS_BOUNDS.x, UNIVERSE_FOCUS_BOUNDS.x),
    clampValue(focus[1], -UNIVERSE_FOCUS_BOUNDS.y, UNIVERSE_FOCUS_BOUNDS.y),
    clampValue(focus[2], -UNIVERSE_FOCUS_BOUNDS.z, UNIVERSE_FOCUS_BOUNDS.z),
  ];
};

const createCameraTarget = (overrides = {}) => {
  const framing = overrides.framing ?? 'universe';
  const minDistance = overrides.minDistance ?? 7;
  const maxDistance = overrides.maxDistance ?? 48;

  return {
    focus: clampFocus(overrides.focus ?? [0, 0, 0], framing),
    distance: clampDistance(overrides.distance ?? 22, minDistance, maxDistance),
    yaw: overrides.yaw ?? -0.12,
    pitch: clampPitch(overrides.pitch ?? 0.1),
    minDistance,
    maxDistance,
    drift: overrides.drift ?? 0.36,
    framing,
    ...overrides,
    focus: clampFocus(overrides.focus ?? [0, 0, 0], framing),
    distance: clampDistance(overrides.distance ?? 22, minDistance, maxDistance),
    pitch: clampPitch(overrides.pitch ?? 0.1),
    minDistance,
    maxDistance,
    framing,
  };
};

const INITIAL_CAMERA = createCameraTarget();
const createTransitionState = (overrides = {}) => ({
  active: false,
  from: 'universe',
  to: 'universe',
  intent: 'idle',
  progress: 1,
  startedAt: 0,
  duration: 1100,
  ...overrides,
});

const getGalaxyById = (id) => galaxies.find((entry) => entry.id === id) ?? null;

const getGalaxyCamera = (galaxy, overrides = {}) =>
  createCameraTarget({
    focus: galaxy.position,
    distance: galaxy.cameraPreset?.distance ?? galaxy.focusDistance ?? 5.2,
    yaw: galaxy.cameraPreset?.yaw ?? galaxy.cameraYaw ?? 0.32,
    pitch: galaxy.cameraPreset?.pitch ?? galaxy.cameraPitch ?? 0.16,
    minDistance: galaxy.cameraPreset?.minDistance ?? galaxy.minDistance ?? 2.8,
    maxDistance: galaxy.cameraPreset?.maxDistance ?? galaxy.maxDistance ?? 10.5,
    drift: 0.18,
    framing: 'galaxy',
    ...overrides,
  });

export const useStore = create((set) => ({
  phase: 'landing',
  isMobile: false,
  dragThresholdPx: 7,
  hudCollapsed: true,
  currentGalaxy: null,
  selectedItem: null,
  hoveredItem: null,
  cameraTarget: INITIAL_CAMERA,
  lastUniverseView: INITIAL_CAMERA,
  interactionState: {
    isDragging: false,
  },
  transitionState: createTransitionState(),
  ui: {
    infoPanelOpen: false,
    modalOpen: false,
    loaderVisible: true,
    warpActive: false,
  },
  setPhase: (phase) => set({ phase }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setHudCollapsed: (hudCollapsed) => set({ hudCollapsed }),
  setDragging: (isDragging) =>
    set((state) => ({ interactionState: { ...state.interactionState, isDragging } })),
  setCurrentGalaxy: (currentGalaxy) => set({ currentGalaxy }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setHoveredItem: (hoveredItem) => set({ hoveredItem }),
  setCameraTarget: (cameraTarget) =>
    set((state) => ({
      cameraTarget: createCameraTarget(
        typeof cameraTarget === 'function'
          ? {
              ...state.cameraTarget,
              ...cameraTarget(state.cameraTarget),
            }
          : {
              ...state.cameraTarget,
              ...cameraTarget,
            },
      ),
    })),
  syncCameraFromControls: ({ focus, distance, yaw, pitch, framing }) =>
    set((state) => {
      const nextFraming = framing ?? state.cameraTarget.framing;
      const minDistance = state.cameraTarget.minDistance;
      const maxDistance = state.cameraTarget.maxDistance;

      return {
        cameraTarget: createCameraTarget({
          ...state.cameraTarget,
          focus: focus ? clampFocus(focus, nextFraming) : state.cameraTarget.focus,
          distance:
            typeof distance === 'number'
              ? clampDistance(distance, minDistance, maxDistance)
              : state.cameraTarget.distance,
          yaw: typeof yaw === 'number' ? yaw : state.cameraTarget.yaw,
          pitch: typeof pitch === 'number' ? clampPitch(pitch) : state.cameraTarget.pitch,
          framing: nextFraming,
        }),
      };
    }),
  setTransitionProgress: (progress) =>
    set((state) => ({
      transitionState: {
        ...state.transitionState,
        progress: clampValue(progress, 0, 1),
      },
    })),
  completeTransition: () =>
    set((state) => ({
      transitionState: {
        ...state.transitionState,
        active: false,
        progress: 1,
      },
    })),
  setInfoPanelOpen: (isOpen) =>
    set((state) => ({ ui: { ...state.ui, infoPanelOpen: isOpen } })),
  setModalOpen: (isOpen) =>
    set((state) => ({ ui: { ...state.ui, modalOpen: isOpen } })),
  setLoaderVisible: (isVisible) =>
    set((state) => ({ ui: { ...state.ui, loaderVisible: isVisible } })),
  setWarpActive: (isActive) =>
    set((state) => ({ ui: { ...state.ui, warpActive: isActive } })),
  focusGalaxy: (galaxy) =>
    set((state) => ({
      currentGalaxy: galaxy.id,
      selectedItem: null,
      hoveredItem: null,
      cameraTarget: getGalaxyCamera(galaxy),
      lastUniverseView: state.currentGalaxy ? state.lastUniverseView : createCameraTarget({ ...state.cameraTarget }),
      transitionState: createTransitionState({
        active: true,
        from: state.currentGalaxy ?? 'universe',
        to: galaxy.id,
        intent: 'enter-galaxy',
        progress: 0,
        startedAt: Date.now(),
        duration: 1350,
      }),
      ui: {
        ...state.ui,
        infoPanelOpen: true,
        modalOpen: false,
        warpActive: true,
      },
    })),
  inspectItem: (payload) =>
    set((state) => {
      const galaxy = payload.galaxyId ? getGalaxyById(payload.galaxyId) : getGalaxyById(state.currentGalaxy);
      const fallbackCamera = galaxy ? getGalaxyCamera(galaxy) : state.cameraTarget;

      return {
        currentGalaxy: payload.galaxyId ?? state.currentGalaxy,
        selectedItem: payload,
        cameraTarget: payload.cameraTarget
          ? createCameraTarget({
              ...fallbackCamera,
              ...payload.cameraTarget,
              framing: 'detail',
              drift: 0.12,
            })
          : fallbackCamera,
        transitionState: createTransitionState({
          active: Boolean(payload.cameraTarget),
          from: state.currentGalaxy ?? 'galaxy',
          to: payload.id ?? payload.title ?? 'node',
          intent: 'inspect-node',
          progress: 0,
          startedAt: Date.now(),
          duration: 900,
        }),
        ui: {
          ...state.ui,
          infoPanelOpen: payload.kind !== 'about',
          modalOpen: payload.kind === 'about',
          warpActive: payload.kind === 'project' || payload.kind === 'research' || payload.kind === 'education',
        },
      };
    }),
  resetSelection: () =>
    set((state) => {
      const galaxy = getGalaxyById(state.currentGalaxy);

      return {
        selectedItem: null,
        cameraTarget: galaxy ? getGalaxyCamera(galaxy) : createCameraTarget({ ...state.lastUniverseView, framing: 'universe' }),
        transitionState: createTransitionState({
          active: true,
          from: 'detail',
          to: galaxy ? galaxy.id : 'universe',
          intent: 'return-orbit',
          progress: 0,
          startedAt: Date.now(),
          duration: 980,
        }),
        ui: {
          ...state.ui,
          infoPanelOpen: Boolean(galaxy),
          modalOpen: false,
        },
      };
    }),
  returnToUniverse: () =>
    set((state) => ({
      currentGalaxy: null,
      selectedItem: null,
      hoveredItem: null,
      cameraTarget: createCameraTarget({ ...state.lastUniverseView, framing: 'universe' }),
      transitionState: createTransitionState({
        active: true,
        from: state.currentGalaxy ?? 'galaxy',
        to: 'universe',
        intent: 'exit-galaxy',
        progress: 0,
        startedAt: Date.now(),
        duration: 1400,
      }),
      ui: {
        ...state.ui,
        infoPanelOpen: false,
        modalOpen: false,
        warpActive: true,
      },
    })),
}));
