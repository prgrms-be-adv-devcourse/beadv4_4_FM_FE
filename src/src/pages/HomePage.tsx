import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { marketApi, type ProductResponse } from '../api/market';

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch more items for better client-side search experience in mockup
                const response = await marketApi.getProducts(0, 50);

                if (response.resultCode && (response.resultCode.startsWith('S-200') || response.resultCode.startsWith('200'))) {
                    setProducts(response.data.content);
                } else {
                    console.error("Product fetch failed with result code:", response.resultCode);
                    setError(`API Error: ${response.msg || response.resultCode}`);
                }
            } catch (err: any) {
                console.error("Failed to fetch products for home", err);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '4rem 2rem',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '3rem',
                textAlign: 'center',
                backgroundImage: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>
                        Mossy Store
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
                        자연을 닮은 당신의 라이프스타일 마켓
                    </p>

                    {/* Search Bar */}
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', backgroundColor: 'white',
                            borderRadius: '50px', padding: '0.5rem 1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <FaSearch style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginRight: '0.75rem' }} />
                            <input
                                type="text"
                                placeholder="원하는 상품을 검색해보세요..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    border: 'none', outline: 'none', width: '100%', fontSize: '1.1rem',
                                    padding: '0.5rem 0', color: 'var(--text-color)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>
                    {searchTerm ? `'${searchTerm}' 검색 결과` : '추천 상품'}
                </h2>
                {products.length > 0 && <Link to="/market" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>전체보기 &rarr;</Link>}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>로딩 중...</div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
                    <p>상품 목록을 불러오는 중 오류가 발생했습니다.</p>
                    <p>{error}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {searchTerm ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {filteredProducts.slice(0, 8).map(product => (
                        <Link to={`/market/${product.productId}`} key={product.productId} className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', display: 'block' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ height: '200px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                    <img src={product.imageUrls[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '3rem', opacity: 0.3 }}>🌿</span>
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                                {product.price.toLocaleString()} 원
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {product.description || ''}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
