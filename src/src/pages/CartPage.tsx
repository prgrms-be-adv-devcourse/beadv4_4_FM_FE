import { useEffect, useState } from 'react';
import { cartApi, type CartResponse } from '../api/cart';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            const response = await cartApi.getCart();
            if (response && response.data) {
                setCart(response.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch cart", err);
            // If checking "not logged in" isn't handled globally
            if (err.message === "로그인이 필요합니다.") {
                alert("로그인이 필요합니다.");
                navigate('/login');
            } else {
                setError("장바구니를 불러오지 못했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (productId: number) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await cartApi.removeFromCart(productId);
            fetchCart(); // Refresh cart
        } catch (err) {
            console.error("Failed to remove item", err);
            alert("상품 삭제에 실패했습니다.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>로딩 중...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '5rem', color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>장바구니</h1>

            {cart && cart.items && cart.items.length > 0 ? (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.items.map(item => (
                            <div key={item.productId} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {item.thumbnailUrl ? (
                                        <img src={item.thumbnailUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2rem', opacity: 0.3 }}>🌿</span>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.productName}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.price.toLocaleString()} 원</p>
                                </div>

                                <div style={{ fontWeight: '600' }}>
                                    {item.quantity}개
                                </div>

                                <button
                                    onClick={() => handleRemove(item.productId)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                            <span>총 주문 금액</span>
                            <span style={{ color: 'var(--primary-color)' }}>
                                {cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} 원
                            </span>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }}>
                            주문하기
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>장바구니가 비어있습니다.</p>
                    <button onClick={() => navigate('/market')} className="btn btn-primary">
                        쇼핑하러 가기
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;
