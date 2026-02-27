import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const errorCode = searchParams.get('code');
    const errorMessage = searchParams.get('message');

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❌</div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>결제에 실패했습니다</h1>

            {errorMessage && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#fff5f5', border: '1px solid #feb2b2' }}>
                    <p style={{ color: '#c53030', marginBottom: '0.5rem' }}>
                        <strong>오류 메시지:</strong> {decodeURIComponent(errorMessage)}
                    </p>
                    {errorCode && (
                        <p style={{ color: '#c53030', fontSize: '0.9rem' }}>
                            오류 코드: {errorCode}
                        </p>
                    )}
                </div>
            )}

            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                결제 중 문제가 발생했습니다. 다시 시도해주세요.
            </p>

            <button
                className="btn btn-primary"
                onClick={() => navigate('/cart')}
                style={{ width: '100%', marginBottom: '1rem' }}
            >
                장바구니로 돌아가기
            </button>
            <button
                className="btn btn-outline"
                onClick={() => navigate('/')}
                style={{ width: '100%' }}
            >
                홈으로
            </button>
        </div>
    );
};

export default PaymentFailPage;
