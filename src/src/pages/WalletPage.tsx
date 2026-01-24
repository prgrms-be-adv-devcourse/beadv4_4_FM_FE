import { useEffect, useState } from 'react';
import { walletApi } from '../api/wallet';

const WalletPage = () => {
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            // For demo purposes, we'll try to fetch user ID 1 or get from local storage if appropriate.
            // In a real app, we'd get the user ID from the logged-in context/token.
            // Since LoginResponse doesn't explicitly return userId based on previous view (it returned tokens),
            // we might need to parse token or fetch 'me'.
            // For now, let's hardcode userId '1' for the mockup connection as requested.
            try {
                const data = await walletApi.getBalance(1);
                setBalance(data.data);
            } catch (error) {
                console.error('Failed to fetch balance', error);
            }
        }
        fetchBalance();
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>내 지갑</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>보유 잔액</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: 'var(--primary-color)' }}>
                        {balance !== null ? `${balance.toLocaleString()}원` : '불러오는 중...'}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }}>충전하기</button>
                        <button className="btn btn-outline" style={{ flex: 1 }}>출금하기</button>
                    </div>
                </div>

                <div className="card">
                    <h3>최근 거래 내역</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                        <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>충전 (무통장 입금)</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>2025.01.15</div>
                            </div>
                            <div style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+500,000원</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
