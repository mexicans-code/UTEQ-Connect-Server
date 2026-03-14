import { Router } from 'express';
import { findAllMostvisited } from './most_visited.service';

const router = Router();

router.get('/', findAllMostvisited);

export default router;