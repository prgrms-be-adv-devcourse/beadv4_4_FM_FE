import client, { type RsData } from './client';

export interface PaymentConfirmRequest {
    paymentKey: string;
    orderId: string;
    amount: number;
    payMethod: string;
}

export interface PaymentResponse {
    paymentId: number;
    paymentKey: string;
    orderNo: string;
    amount: number; // Renamed from totalAmount to match backend
    status: string;
    payMethod: string;
    failReason?: string;
    createdAt?: string;
}

// Toss Payments Client Key
export const TOSS_CLIENT_KEY = 'test_ck_ma60RZblrqRXONzD1LOb8wzYWBn1';

// Initialize Toss Payments Widget
export const loadTossPayments = async () => {
    const { loadTossPayments } = await import('@tosspayments/payment-sdk');
    return await loadTossPayments(TOSS_CLIENT_KEY);
};


export const paymentApi = {
    // Confirm payment after user completes payment
    confirmPayment: async (request: PaymentConfirmRequest) => {
        const response = await client.post<any>('/payments/confirm/toss', request);
        // Backend returns 200 with void/empty body on success
        return response.data;
    },

    // Check payment status by orderNo
    getPaymentsByOrder: async (orderNo: string) => {
        const response = await client.get<RsData<PaymentResponse[]>>(`/payments/orders/${orderNo}`);
        return response.data.data; // Return just the list of payments
    }
};
