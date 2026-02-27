import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { marketApi, type ProductResponse } from '../../api/market';
import { ProductCard } from '../../components/ProductCard';
import { FaLeaf, FaFilter, FaChevronDown, FaHeart } from 'react-icons/fa';

const ProductListPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryQuery = queryParams.get('category') || 'all';
    const searchQuery = queryParams.get('search') || '';

    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Filter states (mocking for UI)
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setPage(0);
        setProducts([]);
        setHasMore(true);

        const fetchInitialProducts = async () => {
            setLoading(true);
            try {
                let categoryId: number | undefined;
                let order: string | undefined;

                if (categoryQuery === 'best') { order = 'POPULAR'; }
                else if (categoryQuery === 'new') { order = 'NEW'; }
                else if (categoryQuery === 'sale' || categoryQuery === 'deals') { order = 'PRICE_ASC'; } // 임의 정렬
                // 카테고리 매핑 (임의 ID 할당 - 백엔드 실제 ID에 맞게 추후 조정 가능)
                if (categoryQuery === 'fashion') { categoryId = 1; }
                else if (categoryQuery === 'beauty') { categoryId = 2; }
                else if (categoryQuery === 'baby') { categoryId = 3; }
                else if (categoryQuery === 'food') { categoryId = 4; }
                else if (categoryQuery === 'kitchen') { categoryId = 5; }
                else if (categoryQuery === 'living') { categoryId = 6; }
                else if (categoryQuery === 'home') { categoryId = 7; }
                else if (categoryQuery === 'digital') { categoryId = 8; }
                else if (categoryQuery === 'sports') { categoryId = 9; }
                else if (categoryQuery === 'car') { categoryId = 10; }
                else if (categoryQuery === 'book') { categoryId = 11; }
                else if (categoryQuery === 'toy') { categoryId = 12; }
                else if (categoryQuery === 'office') { categoryId = 13; }
                else if (categoryQuery === 'pet') { categoryId = 14; }
                else if (categoryQuery === 'health') { categoryId = 15; }
                // 'all'이나 기타 매핑되지 않은 것은 파라미터 제외 (전체 검색)

                const data = await marketApi.getProducts({
                    page: 0,
                    size: 20,
                    keyword: searchQuery,
                    categoryId,
                    order
                });
                // 이전: !['DRAFT', 'INACTIVE', 'SUSPENDED'].includes(p.status || '')
                // 변경: 명시적으로 정상 상태('ACTIVE', 'FOR_SALE', 'PRE_ORDER')인 캐시 데이터만 화면에 노출 (불일치 유령상품 차단)
                const activeProducts = data.data.content.filter(p =>
                    ['ACTIVE', 'FOR_SALE', 'PRE_ORDER'].includes(p.status || '')
                );
                setProducts(activeProducts);
                if (data.data.number >= data.data.totalPages - 1) {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialProducts();
    }, [categoryQuery, searchQuery]);

    const handleLoadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            let categoryId: number | undefined;
            let order: string | undefined;

            if (categoryQuery === 'best') { order = 'POPULAR'; }
            else if (categoryQuery === 'new') { order = 'NEW'; }
            else if (categoryQuery === 'sale' || categoryQuery === 'deals') { order = 'PRICE_ASC'; }
            else if (categoryQuery === 'fashion') { categoryId = 1; }
            else if (categoryQuery === 'beauty') { categoryId = 2; }
            else if (categoryQuery === 'baby') { categoryId = 3; }
            else if (categoryQuery === 'food') { categoryId = 4; }
            else if (categoryQuery === 'kitchen') { categoryId = 5; }
            else if (categoryQuery === 'living') { categoryId = 6; }
            else if (categoryQuery === 'home') { categoryId = 7; }
            else if (categoryQuery === 'digital') { categoryId = 8; }
            else if (categoryQuery === 'sports') { categoryId = 9; }
            else if (categoryQuery === 'car') { categoryId = 10; }
            else if (categoryQuery === 'book') { categoryId = 11; }
            else if (categoryQuery === 'toy') { categoryId = 12; }
            else if (categoryQuery === 'office') { categoryId = 13; }
            else if (categoryQuery === 'pet') { categoryId = 14; }
            else if (categoryQuery === 'health') { categoryId = 15; }

            const data = await marketApi.getProducts({
                page: nextPage,
                size: 20,
                keyword: searchQuery,
                categoryId,
                order
            });
            const activeProducts = data.data.content.filter(p =>
                ['ACTIVE', 'FOR_SALE', 'PRE_ORDER'].includes(p.status || '')
            );
            setProducts(prev => [...prev, ...activeProducts]);
            setPage(nextPage);

            if (data.data.number >= data.data.totalPages - 1) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more products', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Category display name
    const getCategoryName = () => {
        if (searchQuery) return `"${searchQuery}" 검색 결과`;
        const map: Record<string, string> = {
            'all': '전체 상품',
            'fashion': '패션의류/잡화',
            'beauty': '뷰티',
            'baby': '출산/유아동',
            'food': '식품',
            'kitchen': '주방용품',
            'living': '생활용품',
            'home': '홈인테리어',
            'digital': '가전디지털',
            'sports': '스포츠/레저',
            'car': '자동차용품',
            'book': '도서/음반/DVD',
            'toy': '완구/취미',
            'office': '문구/오피스',
            'pet': '반려동물용품',
            'health': '헬스/건강식품'
        };
        return map[categoryQuery] || '전체 상품';
    };

    return (
        <div className="bg-[#FCFBF7] min-h-screen pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-[1200px]">

                {/* 1. Mandatory Top Summary Banner */}
                <div className="mb-10 bg-[#F4F7F4] rounded-2xl p-6 md:p-8 border border-[#E1EADF] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
                    <div className="flex-1">
                        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">{getCategoryName()}</h2>
                        <p className="text-slate-600 text-sm">지구와 나를 위한 현명한 선택, 모시에서 제안합니다.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 bg-white/60 p-4 rounded-xl border border-white/40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <FaLeaf />
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Saved CO₂</span>
                                <span className="block text-sm font-bold text-slate-800">1,204kg 절감</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                <FaHeart />
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Donation</span>
                                <span className="block text-sm font-bold text-slate-800">₩2,400,000 누적</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-[#E8E6E1] rounded-xl font-medium text-slate-700 shadow-sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter className="text-sm" />
                        {showFilters ? '필터 닫기' : '필터 보기'}
                    </button>

                    {/* Left Sidebar (Filters) */}
                    <aside className={`w-full lg:w-[240px] flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden sticky top-[150px]">
                            {/* Eco Filters */}
                            <div className="p-5 border-b border-[#E8E6E1]">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FaLeaf className="text-green-500" /> 친환경 옵션
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                        <span className="text-sm text-slate-600 group-hover:text-[var(--primary-color)] transition-colors">탄소 절감 상품</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                        <span className="text-sm text-slate-600 group-hover:text-[var(--primary-color)] transition-colors">재활용 소재 사용</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                        <span className="text-sm text-slate-600 group-hover:text-[var(--primary-color)] transition-colors">수익금 기부</span>
                                    </label>
                                </div>
                            </div>

                            {/* Delivery & Brand Filters */}
                            <div className="p-5 border-b border-[#E8E6E1]">
                                <h3 className="font-bold text-slate-800 mb-4">배송 혜택</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                        <span className="text-sm text-slate-600 group-hover:text-[var(--primary-color)] transition-colors">에코/종이 포장재</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                        <span className="text-sm text-slate-600 group-hover:text-[var(--primary-color)] transition-colors">무료배송</span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Filter Summary */}
                            <div className="p-5">
                                <h3 className="font-bold text-slate-800 mb-4">가격 (원)</h3>
                                <input type="range" className="w-full accent-[var(--primary-color)]" min="0" max="100" />
                                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                    <span>0</span>
                                    <span>100,000+</span>
                                </div>
                                <button className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">
                                    필터 적용
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content Area (Product Grid) */}
                    <div className="flex-1">
                        {/* Top Control Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <p className="text-sm text-slate-500 font-medium">
                                총 <span className="font-bold text-slate-800">{products.length}</span>개의 상품
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E6E1] rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                    인기순 <FaChevronDown className="text-[10px] text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse border border-[#E8E6E1]"></div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-2xl border border-[#E8E6E1] shadow-sm">
                                <FaLeaf className="text-4xl text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg font-medium">상품을 찾을 수 없습니다.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                    {products.map((product, index) => (
                                        <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-16 text-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            className="px-8 py-3 bg-white border border-[#E8E6E1] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] text-slate-600 font-bold rounded-full transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isLoadingMore ? '불러오는 중...' : '상품 더보기'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
