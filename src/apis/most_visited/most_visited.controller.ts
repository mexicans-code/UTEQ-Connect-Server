
import { findAllMostvisited } from "./most_visited.service";

export const getMostVisited = async () => {
    try {
        const mostVisiteds = await findAllMostvisited();
        return mostVisiteds;
    } catch (error) {
        throw new Error('Error obteniendo los más visitados');
    }
};