import type { NextApiRequest, NextApiResponse } from 'next';
import { getLocationsByAvatarId, getAvailableAvatars } from '../../games/gameManager';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const avatarId = req.query.avatarId as string;
        
        if (!avatarId) {
            // Pokud není zadán žádný avatar, vrátit dostupné avatary
            const availableAvatars = getAvailableAvatars();
            return res.status(200).json({ avatars: availableAvatars });
        }
        
        // Získat lokace podle ID avatara
        const locations = getLocationsByAvatarId(avatarId);
        res.status(200).json(locations);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}