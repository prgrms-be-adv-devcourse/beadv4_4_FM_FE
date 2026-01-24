import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import Modal from '../components/Modal';
import { authApi, type SignupRequest } from '../api/auth';

const SignupPage = () => {
    const navigate = useNavigate();
    const openPostcode = useDaumPostcodePopup('https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState<SignupRequest>({
        email: '',
        password: '',
        name: '',
        nickname: '',
        phoneNum: '',
        address: '',
        rrn: '',
        latitude: 0,
        longitude: 0
    });

    const handleAddressComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        // Geocoding: Convert address to coordinates
        if ((window as any).kakao && (window as any).kakao.maps) {
            const geocoder = new (window as any).kakao.maps.services.Geocoder();
            geocoder.addressSearch(data.address, (result: any, status: any) => {
                if (status === (window as any).kakao.maps.services.Status.OK) {
                    const coords = new (window as any).kakao.maps.LatLng(result[0].y, result[0].x);
                    const latitude = coords.getLat();
                    const longitude = coords.getLng();

                    setFormData(prev => ({
                        ...prev,
                        address: fullAddress,
                        latitude: latitude,
                        longitude: longitude
                    }));
                } else {
                    console.error("Geocoding failed");
                    // Still set address even if geocoding fails, but maybe alert user?
                    setFormData(prev => ({
                        ...prev,
                        address: fullAddress
                    }));
                }
            });
        } else {
            console.error("Kakao Maps SDK not loaded");
            setFormData(prev => ({
                ...prev,
                address: fullAddress
            }));
        }
    };

    const handleSearchAddress = () => {
        openPostcode({ onComplete: handleAddressComplete });
    };
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await authApi.signup(formData);
            // Backend returns "S-200" for success
            if (response.resultCode.startsWith('S-200') || response.resultCode.startsWith('200')) {
                setShowSuccessModal(true);
            } else {
                setError('회원가입 실패: ' + response.msg);
            }
        } catch (err: any) {
            console.error(err);
            setError('회원가입 중 오류가 발생했습니다: ' + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>회원가입</h1>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>이메일</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>비밀번호</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>이름</label>
                        <input name="name" type="text" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>닉네임</label>
                        <input name="nickname" type="text" value={formData.nickname} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>전화번호</label>
                        <input name="phoneNum" type="tel" value={formData.phoneNum} onChange={handleChange} placeholder="010-0000-0000" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>주소</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input name="address" type="text" value={formData.address} onChange={handleChange} required readOnly style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: '#f1f5f9' }} />
                            <button type="button" onClick={handleSearchAddress} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>주소 검색</button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>주민번호 (7자리)</label>
                        <input name="rrn" type="text" value={formData.rrn} onChange={handleChange} placeholder="900101-1" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* 실명 인증 및 정산용</span>
                    </div>

                    {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        가입하기
                    </button>
                </form>
            </div>
            <Modal
                isOpen={showSuccessModal}
                title="회원가입 완료"
                message="회원가입이 성공적으로 완료되었습니다."
                onConfirm={() => {
                    setShowSuccessModal(false);
                    navigate('/login', { replace: true });
                }}
            />
        </div>
    );
};

export default SignupPage;
