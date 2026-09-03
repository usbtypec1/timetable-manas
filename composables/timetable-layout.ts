export const MOBILE_LAYOUT_MAX_WIDTH_PX = 920

export const useTimetableLayout = () => {
  const { width } = useWindowSize()
  const forceDesktopView = ref<boolean>(false)
  const isMobileLayout = computed((): boolean =>
    width.value <= MOBILE_LAYOUT_MAX_WIDTH_PX && !forceDesktopView.value)

  return { forceDesktopView, isMobileLayout }
}
