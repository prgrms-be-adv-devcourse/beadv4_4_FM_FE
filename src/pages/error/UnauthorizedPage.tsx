import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '70vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1.5rem',
            backgroundColor: '#ffffff',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ fontSize: '5rem' }}>🚫</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>
                접근 권한이 없습니다
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', textAlign: 'center', lineHeight: '1.6' }}>
                요청하신 페이지에 접근할 수 있는 권한이 없습니다.<br />
                관리자에게 문의하시거나 다시 로그인해 주세요.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#475569',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    이전 페이지
                </button>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3B5240',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    홈으로 이동
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
