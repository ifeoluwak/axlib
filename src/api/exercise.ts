import { typedApiWrapper } from "../typed";
import apiHandler from "./apiHandler";

export const ExerciseApi = typedApiWrapper({
    getExercises: async () => apiHandler.get('https://wger.de/api/v2/exercise/'),
    getExerciseById() {
        return apiHandler.get('https://wger.de/api/v2/exercise/');
    },
});