import client, { type RsData } from './client';

export interface PayoutResponseDto {
    id: number;
    status: string; // 'CREDITED' | 'COMPLETED'
    amount: number;
    payoutDate: string;
    creditDate: string;
}

export interface PayoutSummary {
    totalAmount: number;
    creditedAmount: number;
    pendingCreditAmount: number;
}

export interface PayoutListResponseDto {
    summary: PayoutSummary;
    payouts: PayoutResponseDto[];
}

export const payoutApi = {
    // Get monthly payouts for the seller
    getMonthlyPayouts: async (year?: number, month?: number) => {
        const params: any = {};
        if (year) params.year = year;
        if (month) params.month = month;

        const response = await client.get<RsData<PayoutListResponseDto>>('/payouts', {
            params,
        });

        return response.data;
    }
}
