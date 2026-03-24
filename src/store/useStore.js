import { create } from 'zustand';

const INITIAL_CAMERA = { position: [0, 0, 22], lookAt: [0, 0, 0], zoom: 1 };

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
      cameraTarget: typeof cameraTarget === 'function' ? cameraTarget(state.cameraTarget) : cameraTarget,
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
      ui: { ...state.ui, infoPanelOpen: true, modalOpen: false, warpActive: true },
      cameraTarget: {
        position: [
          galaxy.position[0] + 0.4,
          galaxy.position[1] + 0.25,
          galaxy.position[2] + (galaxy.focusDistance ?? 5),
        ],
        lookAt: galaxy.position,
        zoom: 1,
      },
    })),
  inspectItem: (payload) =>
    set((state) => ({
      selectedItem: payload,
      ui: { ...state.ui, infoPanelOpen: true, modalOpen: payload.kind === 'about' },
      cameraTarget: payload.cameraTarget ?? state.cameraTarget,
    })),
  resetSelection: () =>
    set((state) => ({
      selectedItem: null,
      ui: { ...state.ui, modalOpen: false },
    })),
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
