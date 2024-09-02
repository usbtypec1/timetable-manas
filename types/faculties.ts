import type { Department } from '~/types/departments'

export interface Faculty {
  id: string
  name: string
  departments: Department[]
}
