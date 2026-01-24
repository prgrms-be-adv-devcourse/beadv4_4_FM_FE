import client, { type RsData } from './client';

export interface CashUserDto {
    id: number;
    email: string;
    name: string;
    nickname: string;
    profileImage: string | null;
    createdAt: string;
}

export interface UserWalletResponseDto {
    walletId: number;
    balance: number;
    user: CashUserDto;
}

export const walletApi = {
    getBalance: async (userId: number) => {
        const response = await client.get<RsData<number>>(`/cash/wallets/users/${userId}/balance`);
        return response.data;
    },
    getUserWallet: async (userId: number) => {
        const response = await client.get<RsData<UserWalletResponseDto>>(`/cash/wallets/users/${userId}`);
        return response.data;
    }
};
