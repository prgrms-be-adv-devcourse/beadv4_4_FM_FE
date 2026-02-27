import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sellerProductApi, type ProductCreateRequest } from '../../../api/sellerProduct';
import { marketApi } from '../../../api/market';
import { memberApi } from '../../../api/member';

const SellerProductEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [sellerId, setSellerId] = useState<number>(0);

    const [formData, setFormData] = useState<ProductCreateRequest>({
        name: '',
        brand: '',
        modelNumber: '',
        categoryId: 1, // 기본값
        description: '',
        thumbnailUrl: '',
        minPrice: 0,
        basePrice: 0,
        weight: 0,
        status: 'ACTIVE',
        quantity: 0
    });

    useEffect(() => {
        const init = async () => {
            try {
                const meRes = await memberApi.getMe();
                let currentSellerId = 0;
                if (meRes.resultCode.startsWith('S-') && meRes.data) {
                    currentSellerId = (meRes.data as any).userId || (meRes.data as any).id || 0;
                    setSellerId(currentSellerId);
                }

                if (isEditMode) {
                    const productRes = await marketApi.getProduct(Number(id));
                    if (productRes && productRes.data) {
                        const p: any = productRes.data;
                        // 매핑
                        setFormData({
                            name: p.name || (p as any).catalog?.name || '',
                            brand: p.brand || (p as any).catalog?.brand || '',
                            description: p.description || (p as any).catalog?.description || '',
                            minPrice: p.minPrice || (p as any).mainProduct?.basePrice || 0,
                            basePrice: (p as any).mainProduct?.basePrice || p.minPrice || 0,
                            status: p.status || 'ACTIVE',
                            quantity: (p as any).mainProduct?.productItems?.[0]?.quantity || 100, // 상세조회 구조에 맞춤
                            weight: p.weight || 0,
                            thumbnailUrl: p.thumbnail || (p as any).catalog?.images?.[0]?.imageUrl || '',
                            // 기타 필요한 필드들 매핑
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to init page', err);
                alert('정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.minPrice === undefined || formData.quantity === undefined) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode) {
                await sellerProductApi.updateProduct(sellerId, Number(id), formData);
                alert('수정되었습니다.');
            } else {
                await sellerProductApi.createProduct(sellerId, formData);
                alert('등록되었습니다.');
            }
            navigate('/myshop/products');
        } catch (err) {
            console.error('Submit failed', err);
            alert('저장에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

    const inputStyle = {
        width: '100%',
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        fontSize: '0.95rem'
    };

    const labelStyle = {
        display: 'block',
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: '0.5rem',
        fontSize: '0.9rem'
    };

    const groupStyle = {
        marginBottom: '1.5rem'
    };

    return (
        <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>
                    &larr;
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '2rem 0' }}>
                    {isEditMode ? '상품 수정' : '새 상품 등록'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>

                {/* 기본 정보 */}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: '#0f172a' }}>기본 정보</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={groupStyle}>
                        <label style={labelStyle}>상품명 *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="예) 친환경 대나무 칫솔" />
                    </div>
                    <div style={groupStyle}>
                        <label style={labelStyle}>브랜드명</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} style={inputStyle} placeholder="브랜드가 있다면 입력하세요" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={groupStyle}>
                        <label style={labelStyle}>카테고리 ID (임시)</label>
                        <input type="number" name="categoryId" value={formData.categoryId} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={groupStyle}>
                        <label style={labelStyle}>상품 상태 *</label>
                        <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                            <option value="ACTIVE">판매중 (기본)</option>
                            <option value="OUT_OF_STOCK">품절</option>
                            <option value="DISCONTINUED">단종</option>
                            <option value="DRAFT">임시저장</option>
                            <option value="INACTIVE">비활성</option>
                            <option value="SUSPENDED">정지됨</option>
                        </select>
                    </div>
                </div>

                {/* 가격 및 재고 */}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: '1rem', color: '#0f172a' }}>가격 및 재고</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={groupStyle}>
                        <label style={labelStyle}>판매가(최저가) (원) *</label>
                        <input type="number" name="minPrice" value={formData.minPrice} onChange={handleChange} required min="0" style={inputStyle} />
                    </div>
                    <div style={groupStyle}>
                        <label style={labelStyle}>재고 수량 *</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" style={inputStyle} />
                    </div>
                    <div style={groupStyle}>
                        <label style={labelStyle}>무게 (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="0" step="0.1" style={inputStyle} />
                    </div>
                </div>

                {/* 상세 정보 */}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: '1rem', color: '#0f172a' }}>상세 정보</h2>

                <div style={groupStyle}>
                    <label style={labelStyle}>대표 이미지(썸네일) URL</label>
                    <input type="text" name="thumbnailUrl" value={formData.thumbnailUrl || ''} onChange={handleChange} style={inputStyle} placeholder="https://picsum.photos/500/500" />
                    {formData.thumbnailUrl && (
                        <div style={{ marginTop: '1rem', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <img src={formData.thumbnailUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    )}
                </div>

                <div style={groupStyle}>
                    <label style={labelStyle}>상품 상세 설명</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} placeholder="상품에 대한 상세한 설명을 적어주세요." />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => navigate(-1)} style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>
                        취소
                    </button>
                    <button type="submit" disabled={submitting} style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? '저장 중...' : (isEditMode ? '수정 내용 저장' : '상품 등록하기')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SellerProductEditPage;
