export type Location = {
    id: string;
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
};

export type Puzzle = {
    id: string;
    locationId: string;
    description: string;
    solution: string;
};

export type GameState = {
    currentLevel: number;
    progress: number;
    isActive: boolean;
};