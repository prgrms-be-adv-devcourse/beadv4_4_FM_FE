import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../api/payment';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const processedRef = useRef(false);

    useEffect(() => {
        // Prevent double execution in React Strict Mode
        if (processedRef.current) {
            console.log('Payment confirmation already processed, skipping...');
            return;
        }

        const confirmPayment = async () => {
            processedRef.current = true;

            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');
            const paymentType = searchParams.get('paymentType') || searchParams.get('method');

            // Check if this is a wallet (deposit) payment
            const isWalletPayment = paymentType === 'WALLET' || paymentType === 'DEPOSIT' || !paymentKey;

            if (isWalletPayment) {
                // Wallet payment - no need to confirm with Toss
                console.log('=== Wallet Payment Success ===');
                console.log('Order ID:', orderId);
                console.log('Amount:', amount);
                setLoading(false);
                return;
            }

            // Toss Payments - need to confirm
            if (!paymentKey || !orderId || !amount) {
                setError('결제 정보가 올바르지 않습니다.');
                setLoading(false);
                return;
            }

            try {
                console.log('=== Payment Confirmation Start ===');
                console.log('Payment Key:', paymentKey);
                console.log('Order ID:', orderId);
                console.log('Amount:', amount);
                console.log('Payment Type:', paymentType);

                const response = await paymentApi.confirmPayment({
                    paymentKey,
                    orderId,
                    amount: Number(amount),
                    payMethod: paymentType || "CARD"
                });

                console.log('=== Payment Confirmation Success ===');
                console.log('Response:', response);
                setLoading(false);
            } catch (err: any) {
                console.error('=== Payment Confirmation Error ===');
                console.error('Full Error:', err);
                console.error('Error Response:', err.response);
                console.error('Error Message:', err.message);
                console.error('Error Status:', err.response?.status);
                console.error('Error Data:', err.response?.data);

                // Check if error is because payment was already confirmed
                const errorMsg = err.response?.data?.msg || err.message || '';
                const isAlreadyConfirmed = errorMsg.includes('이미') ||
                    errorMsg.includes('already') ||
                    err.response?.status === 409;

                if (isAlreadyConfirmed) {
                    console.log('Payment was already confirmed, treating as success');
                    setLoading(false);
                    return;
                }

                // Fallback: Check if payment was actually successful despite the error
                try {
                    const originalOrderNo = orderId.split('__')[0];
                    if (originalOrderNo) {
                        console.log('Attempting fallback verification for order:', originalOrderNo);
                        const verifyResponse = await paymentApi.getPaymentsByOrder(originalOrderNo);
                        // verifyResponse is now the array directly
                        const payments = verifyResponse;

                        const isSuccess = Array.isArray(payments) && payments.some((p: any) => p.status === 'DONE');

                        if (isSuccess) {
                            console.log('✅ Payment verified successfully via fallback check');
                            setLoading(false);
                            return;
                        }
                    }
                } catch (verifyErr) {
                    console.error('Payment verification fallback failed:', verifyErr);
                }

                setError('결제 승인에 실패했습니다: ' + (err.response?.data?.msg || err.message));
                setLoading(false);
            }
        };

        confirmPayment();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h2 style={{ marginBottom: '1rem' }}>결제를 확인하는 중입니다...</h2>
                <p style={{ color: 'var(--text-muted)' }}>잠시만 기다려주세요.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>결제 확인 실패</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{error}</p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/cart')}
                    style={{ marginRight: '1rem' }}
                >
                    장바구니로 돌아가기
                </button>
                <button
                    className="btn btn-outline"
                    onClick={() => navigate('/')}
                >
                    홈으로
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>결제가 완료되었습니다!</h1>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                주문번호: <strong>{searchParams.get('orderId')}</strong>
            </p>
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'left' }}>
                <h3 style={{ marginBottom: '1rem' }}>결제 정보</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>결제 금액</span>
                    <strong>{Number(searchParams.get('amount')).toLocaleString()}원</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>결제 방법</span>
                    <strong>카드 결제</strong>
                </div>
            </div>
            <button
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
                style={{ width: '100%', marginBottom: '1rem' }}
            >
                주문 내역 보기
            </button>
            <button
                className="btn btn-outline"
                onClick={() => navigate('/')}
                style={{ width: '100%' }}
            >
                쇼핑 계속하기
            </button>
        </div>
    );
};

export default PaymentSuccessPage;
