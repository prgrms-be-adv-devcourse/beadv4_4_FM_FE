import client, { type RsData } from './client';

export interface DonationSummaryResponse {
    year: number;
    month: number;
    totalAmount: number;
    totalCarbonOffset: number;
    donationCount: number;
}

export interface DonationLogResponse {
    id: number;
    orderItemId: number;
    amount: number;
    carbonOffset: number;
    createdAt: string;
}

export interface DonationMonthlyHistoryResponse {
    year: number;
    month: number;
    totalAmount: number;
    totalCarbonOffset: number;
    donationCount: number;
    logs: DonationLogResponse[];
}

export const donationApi = {
    // 이번 달 기부 요약 조회
    getSummary: async () => {
        const response = await client.get<RsData<DonationSummaryResponse>>('/donations/summary');
        return response.data;
    },

    // 달별 기부 상세 내역 조회
    getHistory: async () => {
        const response = await client.get<RsData<DonationMonthlyHistoryResponse[]>>('/donations/history');
        return response.data;
    }
};
