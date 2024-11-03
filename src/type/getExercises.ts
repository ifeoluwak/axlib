export type getExercises = {
  count: number;
  next: string;
  previous?: null;
  results?: (ResultsEntity)[] | null;
}
export type ResultsEntity = {
  id: number;
  uuid: string;
  name: string;
  exercise_base: number;
  description: string;
  created: string;
  category: number;
  muscles?: (number | null)[] | null;
  muscles_secondary?: (number | null)[] | null;
  equipment?: (number | null)[] | null;
  language: number;
  license: number;
  license_author?: string | null;
  variations?: (number | null)[] | null;
  author_history?: (string | null)[] | null;
}
