// import { ExerciseApi } from './api/exercise';

import { initialise } from './initializer';

export { typedApi, typedApiWrapper } from './typed';

initialise().catch(console.error);
// ExerciseApi.getExercises();