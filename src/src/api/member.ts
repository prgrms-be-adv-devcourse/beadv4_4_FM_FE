import client, { type RsData } from './client';

export const memberApi = {
    getMe: async () => {
        const response = await client.get<RsData<number>>('/users/me');
        return response.data;
    }
};
