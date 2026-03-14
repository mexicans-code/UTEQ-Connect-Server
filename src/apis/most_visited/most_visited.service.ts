import mostVisited from './most_visited.model.js';


export const findAllMostvisited = async () => {
    try {
        const mostVisiteds = await mostVisited.find();
        return mostVisiteds;
    } catch (error) {
        throw new Error('Error obteniendo los más visitados');
    }
}
