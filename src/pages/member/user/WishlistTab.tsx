import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistApi } from '../../../api/wishlist';

export const WishlistTab = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState<any[]>([]); // 타입 호환성을 위해 any[] 또는 확장된 타입 사용
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await wishlistApi.getMyWishlist();
                if (Array.isArray(res?.data)) {
                    setWishlist(res.data);
                } else if (res?.data && typeof res.data === 'object' && Array.isArray((res.data as any).content)) {
                    setWishlist((res.data as any).content);
                } else {
                    setWishlist([]);
                }
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
                setWishlist([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const removeWishlist = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await wishlistApi.deleteWishlist(id);
            // productId 또는 productItemId를 기준으로 필터링
            setWishlist(prev => prev.filter(item => (item.productId || item.productItemId) !== id));
        } catch (error) {
            console.error('Failed to delete wishlist', error);
            alert('찜 취소에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ padding: '2.5rem 2rem', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                로딩 중...
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '2.5rem 2rem', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px', minHeight: '600px' }}>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', fontWeight: 700, color: '#1e293b' }}>찜 한 상품</h3>
            <div style={{ borderBottom: '2px solid #1e293b', marginBottom: '1.5rem' }}></div>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>찜 한 상품이 없습니다.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {wishlist.map((item, index) => {
                        // 제공된 데이터 포맷에 맞게 식별자(ID) 설정
                        const targetId = item.productId || item.productItemId;
                        const itemKey = item.wishlistId || targetId || index;

                        return (
                            <div
                                key={itemKey}
                                onClick={() => navigate(`/product/${targetId}`)}
                                style={{
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    backgroundColor: '#f1f5f9',
                                    backgroundImage: item.thumbnailUrl ? `url(${item.thumbnailUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    color: '#cbd5e1',
                                    position: 'relative'
                                }}>
                                    {!item.thumbnailUrl && '🌱'}

                                    {/* 찜 취소 하트 버튼 */}
                                    <button
                                        onClick={(e) => removeWishlist(targetId, e)}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            fontSize: '1.2rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        title="찜 취소"
                                    >
                                        ♥
                                    </button>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>{item.categoryName}</div>
                                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                                        {Number(item.totalPrice || item.price || 0).toLocaleString()}원
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};