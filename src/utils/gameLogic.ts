export const checkProgress = (currentLocation: string, targetLocation: string): boolean => {
    return currentLocation === targetLocation;
};

export const evaluateTask = (taskCompleted: boolean): string => {
    return taskCompleted ? "Task completed successfully!" : "Task not completed. Keep trying!";
};

export const getNextLocation = (currentIndex: number, locations: string[]): string | null => {
    if (currentIndex < locations.length - 1) {
        return locations[currentIndex + 1];
    }
    return null;
};