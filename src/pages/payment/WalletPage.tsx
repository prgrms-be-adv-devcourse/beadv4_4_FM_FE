import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletApi, type UserCashLog } from '../../api/wallet';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const WalletPage = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<UserCashLog[]>([]);

    const fetchWalletData = async () => {
        try {
            // 1. Fetch Balance
            const balanceResponse = await walletApi.getBalance();
            // Check for S-200 (Success), 200 (HTTP), or C-200 (Cash/Wallet Success)
            if (balanceResponse && (
                balanceResponse.resultCode.startsWith('S-200') ||
                balanceResponse.resultCode.startsWith('200') ||
                balanceResponse.resultCode.startsWith('C-200')
            )) {
                setBalance(balanceResponse.data);
            } else {
                console.warn('Balance fetch failed or invalid response:', balanceResponse);
                setBalance(0);
            }

            // 2. Fetch Logs
            const logsResponse = await walletApi.getWalletLogs();
            // Check for S-200 (Success), 200 (HTTP), or C-200 (Cash/Wallet Success)
            if (logsResponse && (
                logsResponse.resultCode.startsWith('S-200') ||
                logsResponse.resultCode.startsWith('200') ||
                logsResponse.resultCode.startsWith('C-200')
            )) {
                setLogs(logsResponse.data);
            } else {
                console.warn('Logs fetch failed or invalid response:', logsResponse);
                setLogs([]);
            }

        } catch (error: any) {
            console.error('Failed to fetch wallet data (CATCH ERROR):', error);

            if (error.response?.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [navigate]);

    const handleCharge = async () => {
        const input = prompt('충전할 금액을 입력해주세요 (원):', '10000');
        if (!input) return;
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) {
            alert('올바른 금액을 입력해주세요.');
            return;
        }

        try {
            await walletApi.chargeBalance(amount);
            alert(`${amount.toLocaleString()}원이 충전되었습니다.`);
            fetchWalletData(); // Refresh data
        } catch (error: any) {
            console.error('Charge failed:', error);
            alert('충전에 실패했습니다: ' + (error.response?.data?.msg || error.message));
        }
    };

    const handleWithdraw = async () => {
        const input = prompt('출금할 금액을 입력해주세요 (원):', '10000');
        if (!input) return;
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) {
            alert('올바른 금액을 입력해주세요.');
            return;
        }

        try {
            await walletApi.withdrawBalance(amount);
            alert(`${amount.toLocaleString()}원이 출금되었습니다.`);
            fetchWalletData(); // Refresh data
        } catch (error: any) {
            console.error('Withdraw failed:', error);
            alert('출금에 실패했습니다: ' + (error.response?.data?.msg || error.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] mt-20">
                <div className="text-lg text-[var(--text-muted)] animate-pulse">지갑 정보를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 max-w-5xl pb-20" style={{ paddingTop: '140px' }}>
            <h1 className="text-4xl font-serif font-bold text-primary-color tracking-tight" style={{ marginBottom: '30px' }}>내 지갑</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Balance Card */}
                <Card className="md:col-span-1 bg-stone-50 border-stone-200 h-fit md:sticky top-32">
                    <h3 className="text-text-muted text-sm font-medium mb-2 uppercase tracking-wide">
                        보유 잔액
                    </h3>
                    <div className="text-4xl font-bold mb-8 text-primary-color">
                        {balance.toLocaleString()}<span className="text-xl font-normal ml-1">원</span>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleCharge}
                        >
                            충전하기
                        </Button>
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={handleWithdraw}
                            className="bg-white"
                        >
                            출금하기
                        </Button>
                    </div>
                </Card>

                {/* Transaction History Area */}
                <Card className="md:col-span-2 min-h-[300px]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <h3 className="text-xl font-semibold text-text-main">최근 거래 내역</h3>
                    </div>

                    {logs.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="text-4xl mb-2 opacity-50">🍃</div>
                            <p className="text-sm font-medium">최근 거래 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm hover:border-gray-200 transition-all">
                                    <div>
                                        <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                            {getEventTypeText(log.eventType)}
                                            {/* Optional: Add badge based on type */}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(log.createdAt).toLocaleString('ko-KR')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold text-lg ${log.amount > 0 ? 'text-primary-color' : 'text-danger-color'}`}>
                                            {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}원
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            잔액: {log.balance.toLocaleString()}원
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// Helper to translate event types
const getEventTypeText = (type: string) => {
    switch (type) {
        case 'CHARGE': return '충전';
        case 'PAYMENT': return '결제 차감';
        case 'REFUND': return '환불';
        case 'ADJUSTMENT': return '정산';
        case 'EXCHANGE': return '환전';
        case 'CANCEL': return '취소';
        case 'DEPOSIT': return '입금';
        case 'WITHDRAW': return '출금';
        default: return type;
    }
};

export default WalletPage;
