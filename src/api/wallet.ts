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

export interface UserCashLog {
    id: number;
    eventType: string; // "CHARGE", "PAYMENT", etc.
    amount: number;
    balance: number; // Snapshot balance
    createdAt: string;
}

export const walletApi = {
    getBalance: async () => {
        // Updated path based on user code: @GetMapping("/user/balance")
        const response = await client.get<RsData<number>>(`/cash/wallets/user/balance`);
        return response.data;
    },
    getUserWallet: async () => {
        const response = await client.get<RsData<UserWalletResponseDto>>(`/cash/wallets/user`);
        return response.data;
    },
    getWalletLogs: async () => {
        // Updated path based on user code: @GetMapping("/user/wallet/logs")
        const response = await client.get<RsData<UserCashLog[]>>(`/cash/wallets/user/wallet/logs`);
        return response.data;
    },
    // Charge Balance
    chargeBalance: async (amount: number) => {
        const response = await client.post<RsData<void>>(`/cash/wallets/user/credit`, {
            userId: 0, // Temp fix: Backend DTO requires userId until server restart
            amount,
            eventType: '충전__무통장입금',
            relTypeCode: 'WALLET_CHARGE',
            relId: 0
        });
        return response.data;
    },
    // Withdraw Balance
    withdrawBalance: async (amount: number) => {
        const response = await client.post<RsData<void>>(`/cash/wallets/user/deduct`, {
            userId: 0, // Temp fix: Backend DTO requires userId until server restart
            amount,
            eventType: '사용__주문결제', // Workaround for missing enum on running server
            relTypeCode: 'WALLET_WITHDRAW',
            relId: 0
        });
        return response.data;
    }
};
