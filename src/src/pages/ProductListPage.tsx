import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marketApi, type ProductResponse } from '../api/market';

const ProductListPage = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await marketApi.getProducts();
                setProducts(data.data.content);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '3rem' }}>상품 목록을 불러오는 중...</div>;
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>마켓</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                {products.map(product => (
                    <div key={product.productId} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            {product.imageUrls && product.imageUrls.length > 0 ? <img src={product.imageUrls[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '이미지 없음'}
                        </div>
                        {/* <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{product.category}</div> */}
                        <h3 style={{ margin: '0.5rem 0' }}>{product.name}</h3>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {product.price.toLocaleString()}원
                        </div>
                        <Link to={`/market/${product.productId}`} className="btn btn-outline" style={{ marginTop: 'auto', textAlign: 'center' }}>
                            상세보기
                        </Link>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '0.5rem' }}
                            onClick={(e) => {
                                e.preventDefault();
                                // Hardcoded userId 1 for demo
                                import('../api/cart').then(({ cartApi }) => {
                                    cartApi.addToCart(product.productId, 1).then(() => alert('장바구니에 담겼습니다!'));
                                });
                            }}
                        >
                            장바구니 담기
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;
