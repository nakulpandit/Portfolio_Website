import { create } from 'zustand';
import { galaxies } from '../data/galaxies';

const clampPitch = (pitch) => Math.max(-0.95, Math.min(0.95, pitch));

const createCameraTarget = (overrides = {}) => ({
  focus: [0, 0, 0],
  distance: 22,
  yaw: -0.12,
  pitch: 0.1,
  minDistance: 9,
  maxDistance: 34,
  drift: 0.36,
  framing: 'universe',
  ...overrides,
});

const INITIAL_CAMERA = createCameraTarget();

const getGalaxyById = (id) => galaxies.find((entry) => entry.id === id) ?? null;

const getGalaxyCamera = (galaxy, overrides = {}) =>
  createCameraTarget({
    focus: galaxy.position,
    distance: galaxy.focusDistance ?? 5.2,
    yaw: galaxy.cameraYaw ?? 0.32,
    pitch: galaxy.cameraPitch ?? 0.16,
    minDistance: galaxy.minDistance ?? 2.8,
    maxDistance: galaxy.maxDistance ?? 10.5,
    drift: 0.18,
    framing: 'galaxy',
    ...overrides,
  });

export const useStore = create((set) => ({
  phase: 'landing',
  isMobile: false,
  currentGalaxy: null,
  selectedItem: null,
  hoveredItem: null,
  cameraTarget: INITIAL_CAMERA,
  ui: {
    infoPanelOpen: false,
    modalOpen: false,
    loaderVisible: true,
    warpActive: false,
  },
  setPhase: (phase) => set({ phase }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setCurrentGalaxy: (currentGalaxy) => set({ currentGalaxy }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setHoveredItem: (hoveredItem) => set({ hoveredItem }),
  setCameraTarget: (cameraTarget) =>
    set((state) => ({
      cameraTarget:
        typeof cameraTarget === 'function' ? cameraTarget(state.cameraTarget) : createCameraTarget(cameraTarget),
    })),
  panCamera: ({ deltaX = 0, deltaY = 0, scale = 0.016 } = {}) =>
    set((state) => {
      const depth = Math.max(state.cameraTarget.distance * 0.12, 0.25);
      const panX = deltaX * scale * depth;
      const panY = deltaY * scale * depth;

      return {
        cameraTarget: {
          ...state.cameraTarget,
          focus: [
            state.cameraTarget.focus[0] - panX,
            state.cameraTarget.focus[1] + panY,
            state.cameraTarget.focus[2],
          ],
        },
      };
    }),
  orbitCamera: ({ deltaX = 0, deltaY = 0, yawScale = 0.004, pitchScale = 0.0032 } = {}) =>
    set((state) => ({
      cameraTarget: {
        ...state.cameraTarget,
        yaw: state.cameraTarget.yaw - deltaX * yawScale,
        pitch: clampPitch(state.cameraTarget.pitch - deltaY * pitchScale),
      },
    })),
  zoomCamera: (delta) =>
    set((state) => ({
      cameraTarget: {
        ...state.cameraTarget,
        distance: Math.min(
          state.cameraTarget.maxDistance,
          Math.max(state.cameraTarget.minDistance, state.cameraTarget.distance + delta),
        ),
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
        cameraTarget: galaxy ? getGalaxyCamera(galaxy) : INITIAL_CAMERA,
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
      cameraTarget: INITIAL_CAMERA,
      ui: {
        ...state.ui,
        infoPanelOpen: false,
        modalOpen: false,
        warpActive: true,
      },
    })),
}));
