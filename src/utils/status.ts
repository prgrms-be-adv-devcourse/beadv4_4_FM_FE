export const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
        'PENDING': '주문접수',
        'PAID': '결제완료',
        'PAYMENT_COMPLETED': '결제완료',
        'PREPARING': '배송준비',
        'PREPARE': '배송준비',
        'SHIPPING': '배송중',
        'DELIVERED': '배송완료',
        'CANCELLED': '주문취소',
        'CANCELED': '주문취소',
        'CANCEL_REQUESTED': '주문취소 요청',
        'CANCEL_COMPLETED': '주문취소 완료',
        'PARTIAL_CANCELED': '부분 환불',
        'REFUNDED': '환불완료'
    };
    return statusMap[status] || status;
};

export const getStatusColor = (status: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        'PENDING': { bg: '#fef3c7', text: '#92400e' },
        'PAID': { bg: '#dbeafe', text: '#1e40af' },
        'PAYMENT_COMPLETED': { bg: '#dbeafe', text: '#1e40af' },
        'PREPARING': { bg: '#e0e7ff', text: '#4338ca' },
        'PREPARE': { bg: '#e0e7ff', text: '#4338ca' },
        'SHIPPING': { bg: '#ddd6fe', text: '#6b21a8' },
        'DELIVERED': { bg: '#d1fae5', text: '#065f46' },
        'CANCELLED': { bg: '#fee2e2', text: '#991b1b' },
        'CANCELED': { bg: '#fee2e2', text: '#991b1b' },
        'CANCEL_REQUESTED': { bg: '#fee2e2', text: '#991b1b' },
        'CANCEL_COMPLETED': { bg: '#fee2e2', text: '#991b1b' },
        'PARTIAL_CANCELED': { bg: '#fef9c3', text: '#ca8a04' },
        'REFUNDED': { bg: '#f1f5f9', text: '#475569' }
    };
    return colorMap[status] || { bg: '#f1f5f9', text: '#475569' };
};
