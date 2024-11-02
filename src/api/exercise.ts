import { typedApiWrapper } from '../typed';
import apiHandler from './apiHandler';

export const ExerciseApi = typedApiWrapper({
  getExercises: async () => apiHandler.get('https://wger.de/api/v2/exercise/'),
  getExerciseById(id: string) {
    return apiHandler.get(`https://wger.de/api/v2/exercise/${id}`);
  },
});
