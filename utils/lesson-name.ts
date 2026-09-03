export const parseLessonName = (name: string): { code: string, title: string } => {
  const trimmed = (name ?? '').trim()
  const match = trimmed.match(/^(\S+)\s+(.*)$/)

  if (!match) {
    return { code: '', title: trimmed }
  }

  const [, code, title] = match
  return { code, title: title.trim() }
}
