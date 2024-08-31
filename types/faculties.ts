import type { Department } from '~/types/departments'

export interface Faculty {
  name: string
  departments: Department[]
}
