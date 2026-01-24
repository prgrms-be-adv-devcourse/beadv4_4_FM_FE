import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketApi, type ProductResponse } from '../api/market';
import { cartApi } from '../api/cart';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await marketApi.getProduct(Number(id));
                if (data && (data.resultCode?.startsWith('2') || data.resultCode?.startsWith('S-2'))) {
                    setProduct(data.data as any);
                } else {
                    setError(data.msg || '상품을 찾을 수 없습니다.');
                }
            } catch (err) {
                console.error("Failed to fetch product", err);
                setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await cartApi.addToCart(product.productId, quantity);
            if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
                navigate('/cart');
            }
        } catch (err: any) {
            console.error("Failed to add to cart", err);
            alert(err.message || '장바구니 담기에 실패했습니다.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>로딩 중...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '5rem', color: 'red' }}>{error}</div>;
    if (!product) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    fontSize: '1rem'
                }}
            >
                &larr; 뒤로가기
            </button>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '4rem',
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Image Section */}
                <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc',
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <span style={{ fontSize: '5rem', opacity: 0.2 }}>🌿</span>
                    )}
                </div>

                {/* Info Section */}
                <div>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '1rem'
                    }}>
                        {product.status === 'FOR_SALE' ? '판매중' : '품절'}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>{product.name}</h1>

                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)',
                        marginBottom: '2rem'
                    }}>
                        {product.price?.toLocaleString() ?? 0} 원
                    </p>

                    <div style={{
                        borderTop: '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '1.5rem 0',
                        marginBottom: '2rem'
                    }}>
                        <p style={{ lineHeight: 1.6, color: 'var(--text-color)', fontSize: '1.1rem' }}>
                            {product.description}
                        </p>
                    </div>

                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.875rem' }}>남은 수량</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{product.quantity}개</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.875rem' }}>무게</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{product.weight ?? 0}kg</span>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>수량 선택</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)', backgroundColor: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
                            >-</button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity || 99, Number(e.target.value))))}
                                style={{ width: '80px', height: '40px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem' }}
                            />
                            <button
                                onClick={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)', backgroundColor: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
                            >+</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleAddToCart}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: 'white',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                            장바구니 담기
                        </button>
                        <button style={{
                            flex: 1,
                            padding: '1rem',
                            backgroundColor: 'var(--primary-color)',
                            border: 'none',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                            바로 구매하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
