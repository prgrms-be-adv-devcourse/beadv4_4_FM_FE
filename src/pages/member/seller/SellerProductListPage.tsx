import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sellerProductApi } from '../../../api/sellerProduct';
import { memberApi } from '../../../api/member';
import type { ProductResponse } from '../../../api/market';
import { cleanProductName } from '../../../utils/format';
import { FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';

const SellerProductListPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellerId, setSellerId] = useState<number>(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const meRes = await memberApi.getMe();
                let id = 0;
                if (meRes.resultCode.startsWith('S-') && meRes.data) {
                    id = (meRes.data as any).userId || (meRes.data as any).id || 0;
                    setSellerId(id);
                }
                fetchProducts(id, page, searchKeyword);
            } catch (err) {
                console.error('Failed to get user info', err);
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchProducts = async (id: number, currentPage: number, searchKwd: string) => {
        setLoading(true);
        try {
            const data = await sellerProductApi.getMyProducts(id, currentPage, 10, searchKwd);
            if (data && data.data) {
                setProducts(data.data.content);
                setTotalPages(data.data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch seller products', error);
            // 만약 인증 에러 발생 시 처리 (interceptors가 하겠지만 임시로)
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchProducts(sellerId, newPage, searchKeyword);
    };

    // 검색 실행
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearchKeyword(keyword);
        fetchProducts(sellerId, 0, keyword);
    };

    const handleDelete = async (productId: number) => {
        if (!window.confirm('정말 이 상품을 삭제(비활성화) 하시겠습니까?')) return;
        try {
            await sellerProductApi.deleteProduct(sellerId, productId);
            alert('삭제되었습니다.');
            fetchProducts(sellerId, page, searchKeyword);
        } catch (err) {
            console.error(err);
            alert('삭제에 실패했습니다.');
        }
    };

    // 상태 한글 변환
    const getStatusText = (status?: string) => {
        switch (status) {
            case 'ACTIVE': return '판매중';
            case 'OUT_OF_STOCK': return '품절';
            case 'DISCONTINUED': return '단종';
            case 'DRAFT': return '임시저장';
            case 'INACTIVE': return '비활성';
            case 'SUSPENDED': return '정지됨';
            case 'FOR_SALE': return '판매중'; // 기존 API 호환
            default: return status || '알수없음';
        }
    };

    const getStatusStyle = (status?: string) => {
        const text = getStatusText(status);
        if (text === '판매중') return { bg: '#dcfce7', text: '#166534' };
        if (text === '품절' || text === '단종') return { bg: '#fee2e2', text: '#991b1b' };
        return { bg: '#f1f5f9', text: '#475569' };
    };

    return (
        <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>나의 상품 관리</h1>
                <Link
                    to="/myshop/products/new"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        backgroundColor: 'var(--primary-color)', color: 'white',
                        padding: '0.75rem 1.5rem', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <FaPlus /> 상품 등록
                </Link>
            </div>

            {/* Search Bar */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="상품명 또는 브랜드를 검색하세요"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                    <button
                        type="submit"
                        style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        검색
                    </button>
                </form>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 3fr 1fr 1fr 1fr 1fr 120px', padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#64748b', fontSize: '0.9rem' }}>
                    <div>이미지</div>
                    <div>상품 정보</div>
                    <div>가격</div>
                    <div>상태</div>
                    <div>판매량</div>
                    <div>리뷰 수</div>
                    <div style={{ textAlign: 'center' }}>관리</div>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>상품을 불러오는 중입니다...</div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📦</div>
                        {searchKeyword ? `"${searchKeyword}" 검색 결과가 없습니다.` : '등록된 상품이 없습니다.'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {products.map((p) => (
                            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 3fr 1fr 1fr 1fr 1fr 120px', padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '0.95rem' }}>
                                {/* Image */}
                                <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {p.thumbnail ? (
                                        <img src={p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FaImage style={{ color: '#cbd5e1', fontSize: '1.5rem' }} />
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingRight: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{p.brand || '브랜드 없음'}</div>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                                        <Link to={`/market/${p.id}`} target="_blank" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[var(--primary-color)] transition-colors">
                                            {cleanProductName(p.name)}
                                        </Link>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.categoryName || '카테고리 미지정'}</div>
                                </div>

                                {/* Price */}
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                                    {p.minPrice?.toLocaleString() || 0}원
                                </div>

                                {/* Status */}
                                <div>
                                    <span style={{
                                        backgroundColor: getStatusStyle(p.status).bg,
                                        color: getStatusStyle(p.status).text,
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getStatusText(p.status)}
                                    </span>
                                </div>

                                {/* Sales */}
                                <div style={{ color: '#475569' }}>{p.salesCount?.toLocaleString() || 0}개</div>

                                {/* Reviews */}
                                <div style={{ color: '#475569' }}>{p.reviewCount?.toLocaleString() || 0}건</div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => navigate(`/myshop/products/${p.id}/edit`)}
                                        style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                                        title="수정"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                                        title="삭제"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        onClick={() => handlePageChange(Math.max(0, page - 1))}
                        disabled={page === 0}
                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: page === 0 ? '#f8fafc' : '#ffffff', color: page === 0 ? '#94a3b8' : '#1e293b', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        이전
                    </button>
                    <span style={{ color: '#475569', fontWeight: 500 }}>
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: page >= totalPages - 1 ? '#f8fafc' : '#ffffff', color: page >= totalPages - 1 ? '#94a3b8' : '#1e293b', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
};

export default SellerProductListPage;
