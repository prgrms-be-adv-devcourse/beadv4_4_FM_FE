import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketApi, type ProductDetailResponse, type ProductItem } from '../../api/market';
import { cartApi } from '../../api/cart';
import { Button } from '../../components/Button';
import { ProductReviews } from '../../components/ProductReviews';
import { ProductCoupons } from '../../components/ProductCoupons';
import { FaLeaf, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { cleanProductName } from '../../utils/format';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 옵션 선택 상태 관리
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);

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

    // 모든 옵션이 선택되었는지 확인 (선택 여부만 검사)
    const isAllOptionsSelected = useMemo(() => {
        if (!product?.mainProduct) return false;

        if (!product.mainProduct.optionGroups || product.mainProduct.optionGroups.length === 0) {
            if (product.mainProduct.productItems.length === 1) return true;
            return !!selectedOptions['__itemId']; 
        }

        return product.mainProduct.optionGroups.every(group => !!selectedOptions[group.name]);
    }, [product, selectedOptions]);

    // 선택된 아이템 (문자열 비교 로직 제거, 강제로 첫번째 아이템 매핑하여 통과되도록 수정)
    const selectedItem = useMemo<ProductItem | null>(() => {
        if (!product?.mainProduct?.productItems || product.mainProduct.productItems.length === 0) return null;

        // 드롭다운으로 __itemId를 직접 선택한 경우
        if (selectedOptions['__itemId']) {
            return product.mainProduct.productItems.find(item => item.productItemsId.toString() === selectedOptions['__itemId']) || product.mainProduct.productItems[0];
        }

        // optionCombination 비교 없이, 첫 번째 품목을 결제/장바구니용 데이터로 무조건 사용
        return product.mainProduct.productItems[0];
    }, [product, selectedOptions]);

    const handleOptionChange = (groupName: string, value: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [groupName]: value
        }));
    };

    const handleAddToCart = async () => {
        if (!product) return;
        
        // 문자열 매칭 상관없이 옵션들을 "선택했는지"만 검사
        if (!isAllOptionsSelected) {
            alert('모든 옵션을 선택해주세요.');
            return;
        }

        try {
            if (!product.mainProduct) return;
            await cartApi.addToCart(product.mainProduct.productId, quantity);
            if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
                navigate('/cart');
            }
        } catch (err: any) {
            console.error("Failed to add to cart", err);
            if (err.message === "로그인이 필요합니다." || err.response?.status === 401) {
                alert("로그인이 필요합니다.");
                navigate('/login');
            } else {
                alert(err.message || '장바구니 담기에 실패했습니다.');
            }
        }
    };

    // 이미지 파싱 로직
    const parsedImages = useMemo(() => {
        if (!product) return [];
        const images = product.catalog.images;
        if (typeof images === 'string') {
            try {
                return JSON.parse(images);
            } catch (e) {
                console.error("이미지 데이터 파싱 오류:", e);
                return [];
            }
        }
        if (Array.isArray(images)) return images;
        return [];
    }, [product]);

    // mainImage 문자열(URL) 안전하게 추출
    const mainImage = useMemo(() => {
        if (parsedImages.length === 0) return null;
        
        const thumb = parsedImages.find((img: any) => img && typeof img === 'object' && img.isThumbnail);
        if (thumb && thumb.imageUrl) return thumb.imageUrl;
        
        if (parsedImages[0] && typeof parsedImages[0] === 'object' && parsedImages[0].imageUrl) {
            return parsedImages[0].imageUrl;
        }
        
        if (typeof parsedImages[0] === 'string') return parsedImages[0];
        
        return null;
    }, [parsedImages]);

    const handleDirectOrder = async (type: 'TOSS' | 'CASH') => {
        if (!product || !product.mainProduct) return;
        
        // 문자열 매칭 상관없이 옵션들을 "선택했는지"만 검사
        if (!isAllOptionsSelected || !selectedItem) {
            alert('모든 필수 옵션을 선택해주세요.');
            return;
        }

        if (!window.confirm(type === 'TOSS' ? "바로 주문하시겠습니까?" : "예치금으로 바로 결제하시겠습니까?")) return;

        try {
            const requestTotalPrice = selectedItem.totalPrice * quantity;

            const orderItems = [{
                productId: product.mainProduct.productId,
                productItemId: selectedItem.productItemsId,
                sellerId: product.mainProduct.sellerId || 0,
                productName: cleanProductName(product.catalog?.name),
                categoryName: product.catalog?.categoryName || "",
                price: selectedItem.totalPrice,
                weight: selectedItem.weight,
                thumbnailUrl: mainImage || "", 
                quantity: quantity
            }];

            const orderRequest = {
                totalPrice: requestTotalPrice,
                paymentType: type === 'TOSS' ? "CARD" : "CASH",
                items: orderItems
            };

            const orderResponse = await import('../../api/order').then(({ orderApi }) => orderApi.createOrder(orderRequest));

            if (!orderResponse.data || !orderResponse.data.orderId) {
                throw new Error('주문 생성에 실패했습니다.');
            }

            const { orderNo } = orderResponse.data;
            const uniqueOrderId = `${orderNo}__${Date.now()}`;

            if (type === 'TOSS') {
                const { loadTossPayments } = await import('@tosspayments/payment-sdk');
                const { TOSS_CLIENT_KEY } = await import('../../api/payment');
                const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

                await tossPayments.requestPayment('카드', {
                    amount: requestTotalPrice,
                    orderId: uniqueOrderId,
                    orderName: `${cleanProductName(product.catalog?.name)} ${quantity > 1 ? `외 ${quantity - 1}건` : ''}`,
                    successUrl: `${window.location.origin}/payment/success`,
                    failUrl: `${window.location.origin}/payment/fail`,
                });
            } else {
                window.location.href = `/payment/success?orderId=${uniqueOrderId}&amount=${requestTotalPrice}&method=CASH&status=DONE`;
            }

        } catch (err: any) {
            console.error("Order failed", err);
            alert("주문 접수 중 오류가 발생했습니다.\n" + (err.response?.data?.msg || err.message));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] mt-20">
            <div className="text-lg text-[var(--text-muted)] animate-pulse">상품 상세정보를 불러오는 중...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[60vh] mt-20">
            <div className="text-lg text-red-500">{error}</div>
        </div>
    );

    if (!product) return null;

    const { catalog, mainProduct } = product;
    const isAvailable = !!mainProduct;
    const currentPrice = selectedItem ? selectedItem.totalPrice : (mainProduct?.basePrice || 0);
    const currentWeight = selectedItem ? selectedItem.weight : 0;
    const currentQuantity = selectedItem ? selectedItem.quantity : 0;
    const productStatus = !isAvailable ? 'SOLD_OUT' : (selectedItem ? selectedItem.status : 'ON_SALE');

    return (
        <div className="min-h-screen bg-[var(--background-color)] pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors flex items-center gap-2 font-medium"
                >
                    &larr; 돌아가기
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 bg-white p-8 md:p-12 rounded-[2rem] border border-[var(--border-color)] shadow-sm">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-[#f8fafc] rounded-[1.5rem] overflow-hidden flex items-center justify-center relative shadow-inner">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={catalog.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="text-center opacity-30">
                                    <FaLeaf className="text-8xl mx-auto mb-4 text-[var(--secondary-color)]" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <FaLeaf className="mx-auto text-green-600 mb-2" />
                                <span className="text-xs font-semibold text-green-700">친환경 소재</span>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <FaShieldAlt className="mx-auto text-blue-600 mb-2" />
                                <span className="text-xs font-semibold text-blue-700">인증 완료</span>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-xl">
                                <FaTruck className="mx-auto text-orange-600 mb-2" />
                                <span className="text-xs font-semibold text-orange-700">안전 배송</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 mr-2 ${productStatus === 'ON_SALE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                {productStatus === 'ON_SALE' ? 'In Stock' : 'Sold Out'}
                            </span>
                            {catalog.brand && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 mb-2">
                                    {catalog.brand}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--text-main)] mb-4 leading-tight">
                            {cleanProductName(catalog?.name)}
                        </h1>

                        {isAvailable ? (
                            <p className="text-3xl font-bold text-[var(--primary-color)] mb-8 border-b border-[var(--border-color)] pb-8">
                                {currentPrice.toLocaleString()} <span className="text-lg font-normal text-[var(--text-muted)]">원</span>
                            </p>
                        ) : (
                            <p className="text-2xl font-bold text-slate-500 mb-8 border-b border-[var(--border-color)] pb-8">
                                현재 판매 중이지 않은 상품입니다.
                            </p>
                        )}

                        <div className="prose prose-lg text-[var(--text-muted)] mb-8 leading-relaxed max-w-none">
                            <p>{catalog?.description}</p>
                        </div>
                        
                        {/* Options Selector */}
                        {mainProduct?.optionGroups && mainProduct.optionGroups.length > 0 ? (
                            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">옵션 선택</h3>
                                {mainProduct.optionGroups.map((group) => (
                                    <div key={group.groupId}>
                                        <label className="block text-sm text-gray-600 mb-1">{group.name}</label>
                                        <select
                                            value={selectedOptions[group.name] || ''}
                                            onChange={(e) => handleOptionChange(group.name, e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-shadow"
                                        >
                                            <option value="" disabled>{group.name}을(를) 선택하세요</option>
                                            {group.values.map((val) => (
                                                <option key={val} value={val}>{val}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ) : mainProduct?.productItems && mainProduct.productItems.length > 1 ? (
                            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">상품 품목 선택</h3>
                                <div>
                                    <select
                                        value={selectedOptions['__itemId'] || ''}
                                        onChange={(e) => handleOptionChange('__itemId', e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-shadow"
                                    >
                                        <option value="" disabled>상품을 선택하세요</option>
                                        {mainProduct.productItems.map((item) => (
                                            <option key={item.productItemsId} value={item.productItemsId.toString()}>
                                                {item.optionCombination} - {item.totalPrice.toLocaleString()}원
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : null}

                        {isAvailable ? (
                            <>
                                <div className="mb-10">
                                    <ProductCoupons productItemId={selectedItem?.productItemsId} />
                                </div>
                                <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                                    <div>
                                        <span className="block text-[var(--text-muted)] mb-1">잔여 수량</span>
                                        <span className="block font-semibold text-[var(--text-main)] text-lg">
                                            {isAllOptionsSelected && selectedItem ? `${currentQuantity}개` : '옵션 선택 요망'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[var(--text-muted)] mb-1">무게</span>
                                        <span className="block font-semibold text-[var(--text-main)] text-lg">{currentWeight}g</span>
                                    </div>
                                </div>
                                <div className="mt-auto space-y-8">
                                    {/* Quantity Selector */}
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-main)] mb-3">수량 선택</label>
                                        <div className="flex items-center gap-4 bg-slate-50 inline-flex p-2 rounded-full border border-slate-200">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors"
                                            >-</button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))}
                                                className="w-16 text-center bg-transparent font-bold text-lg outline-none"
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors"
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                fullWidth
                                                onClick={handleAddToCart}
                                                className="h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!isAllOptionsSelected}
                                            >
                                                장바구니 담기
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                fullWidth
                                                onClick={() => handleDirectOrder('TOSS')}
                                                className="h-14 bg-primary-color disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!isAllOptionsSelected}
                                            >
                                                카드 결제하기
                                            </Button>
                                            <Button
                                                size="lg"
                                                fullWidth
                                                onClick={() => handleDirectOrder('CASH')}
                                                className="h-14 bg-emerald-600 text-white hover:bg-emerald-700 border-none shadow-lg shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!isAllOptionsSelected}
                                            >
                                                예치금 결제
                                            </Button>
                                        </div>
                                        {!isAllOptionsSelected && (
                                            <p className="text-sm text-red-500 text-center font-medium">
                                                상품의 옵션을 먼저 선택해주세요.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-auto bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
                                <p className="text-slate-600 font-bold text-lg">품절된 상품입니다.</p>
                                <p className="text-slate-400 text-sm mt-2">현재 판매 중인 내역이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    {product.mainProduct && (
                        <ProductReviews productId={product.mainProduct.productId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;