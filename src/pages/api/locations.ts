import type { NextApiRequest, NextApiResponse } from 'next';
import { puzzleLocations } from '../../data/puzzleLocations';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        res.status(200).json(puzzleLocations);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}