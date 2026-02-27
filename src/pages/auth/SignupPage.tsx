import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { FaLeaf, FaGlobeAmericas, FaCamera } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { authApi } from '../../api/auth';

const SignupPage = () => {
    const navigate = useNavigate();
    const openPostcode = useDaumPostcodePopup('https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');
    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        nickname: '',
        phoneNum: '',
        address: '',
        rrn: '',
        latitude: 0,
        longitude: 0,
    });
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    // Profile Image state
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    // State for Map SDK
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    // Additional state for error handling and success modal
    // Robust Script Loader
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds (100ms * 100)

        const checkMapLoaded = () => {
            // Check if the script is loaded and the kakao object is available
            if ((window as any).kakao && (window as any).kakao.maps) {
                // Initialize using the autoload=false pattern
                (window as any).kakao.maps.load(() => {
                    console.log("KaKao Maps SDK loaded and initialized.");
                    setIsMapLoaded(true);
                    setMapError(false);
                });
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkMapLoaded, 100);
                } else {
                    console.error("Kakao Maps SDK failed to load within timeout (10s).");
                    setMapError(true);
                    alert(`지도 스크립트 로딩 실패.\n\n[체크리스트]\n1. Kakao Developers > 내 애플리케이션 > 플랫폼 > Web > 사이트 도메인에 '${window.location.origin}' 이 등록되어 있는지 확인해주세요.\n(현재 실행 중인 포트가 ${window.location.port} 입니다)\n\n2. API 키가 정확한지 확인해주세요.`);
                }
            }
        };

        checkMapLoaded();
    }, []);

    const handleAddressComplete = (data: any) => {
        // User requested ONLY basic address to be sent to API
        const basicAddress = data.roadAddress || data.address;

        // Geocoding
        if (isMapLoaded && (window as any).kakao && (window as any).kakao.maps) {
            (window as any).kakao.maps.load(() => {
                const geocoder = new (window as any).kakao.maps.services.Geocoder();
                // Search using ONLY basic address
                geocoder.addressSearch(basicAddress, (result: any, status: any) => {
                    if (status === (window as any).kakao.maps.services.Status.OK) {
                        const coords = new (window as any).kakao.maps.LatLng(result[0].y, result[0].x);
                        const latitude = coords.getLat();
                        const longitude = coords.getLng();

                        console.log("Geocoding success:", latitude, longitude);

                        setFormData(prev => ({
                            ...prev,
                            address: basicAddress, // Use basic address
                            latitude: latitude,
                            longitude: longitude
                        }));
                    } else {
                        console.warn("Geocoding failed. Status:", status);
                        // Graceful Fallback: No Alert, just set 0
                        setFormData(prev => ({
                            ...prev,
                            address: basicAddress, // Use basic address even if map fails
                            latitude: 0,
                            longitude: 0
                        }));
                    }
                });
            });
        } else {
            console.warn("Kakao Maps SDK not ready");
            // Graceful Fallback: No Alert
            setFormData(prev => ({
                ...prev,
                address: basicAddress // Use basic address
            }));
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };
    const handleSearchAddress = () => {
        if (mapError) {
            // If map is broken, manual input is enabled.
            // Just focus the input field for the user.
            document.getElementsByName('address')[0]?.focus();
            return;
        }
        if (!isMapLoaded) {
            alert("지도 서비스를 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }
        openPostcode({ onComplete: handleAddressComplete });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // TEMPORARY: Always use Seoul City Hall coordinates if missing (for testing)
        // User requested to bypass coordinate validation
        let finalData = { ...formData };
        if (finalData.latitude === 0 || finalData.longitude === 0) {
            console.warn("Missing coordinates. Using Seoul City Hall fallback for testing.");
            finalData.latitude = 37.5665;
            finalData.longitude = 126.9780;
        }

        try {
            const response = await authApi.signup(finalData, profileImage);
            // Backend returns "S-201" or "201" for signup success
            if (
                response.resultCode.startsWith('S-') ||
                response.resultCode.startsWith('20')
            ) {
                setShowSuccessModal(true);
            } else {
                setError('회원가입 실패: ' + response.msg);
            }
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.msg || err.message;
            if (err.response?.status === 409) {
                setErrorModalMessage('회원가입 중 오류가 발생했습니다: ' + errorMessage);
                setShowErrorModal(true);
            } else {
                setErrorModalMessage('회원가입 중 오류가 발생했습니다: ' + errorMessage);
                setShowErrorModal(true);
            }
            setError('회원가입 중 오류가 발생했습니다: ' + errorMessage);
        }
    };

    return (
        <div className="min-h-screen py-12 flex flex-col items-center justify-center bg-slate-50 relative z-0">
            {/* Top subtle background overlay */}
            <div
                className="absolute top-0 left-0 w-full h-[50vh] bg-cover bg-center pointer-events-none -z-10"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=2070&auto=format&fit=crop)',
                    opacity: 0.05,
                    maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
                }}
            ></div>

            <div className="w-full max-w-[540px] px-4">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#1D3130] mb-3">회원가입</h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        친환경 상품, 탄소 절감·기부 내역을 한 눈에 모아보세요.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-[#E4E4E4] rounded-2xl p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <form onSubmit={handleSubmit} className="flex flex-col">

                        {/* Profile Image Upload */}
                        <div className="flex flex-col items-center mb-10">
                            <div
                                className="w-[100px] h-[100px] rounded-full flex items-center justify-center cursor-pointer relative group border-2 border-dashed border-slate-300 hover:border-[#89B18A] transition-colors bg-slate-50 overflow-hidden"
                                onClick={() => document.getElementById('profileImageInput')?.click()}
                            >
                                {profileImagePreview ? (
                                    <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center text-[#89B18A] text-4xl">
                                        <FaGlobeAmericas className="absolute right-3 bottom-2 text-2xl text-[#89B18A]/50 z-0" />
                                        <FaLeaf className="relative z-10" />
                                    </div>
                                )}

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all z-20">
                                    <FaCamera className="text-white text-2xl" />
                                </div>
                            </div>
                            <input
                                id="profileImageInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <span className="text-[13px] text-slate-500 font-medium mt-3">프로필 이미지 (선택)</span>
                        </div>

                        {/* Section 1: Basic Info */}
                        <div className="mb-10">
                            <h3 className="text-[17px] font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1D3130] block"></span>
                                기본 정보
                            </h3>
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium">이메일</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] bg-slate-50 focus:bg-white" placeholder="example@mossy.com" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium">비밀번호</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] bg-slate-50 focus:bg-white" placeholder="비밀번호 입력" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium">이름</label>
                                    <input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] bg-slate-50 focus:bg-white" placeholder="실명 입력" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium">닉네임</label>
                                    <input name="nickname" type="text" value={formData.nickname} onChange={handleChange} required className="w-full p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] bg-slate-50 focus:bg-white" placeholder="모시에서 사용할 이름" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact & Address */}
                        <div className="mb-6">
                            <h3 className="text-[17px] font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1D3130] block"></span>
                                연락처 및 배송지
                            </h3>
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium">전화번호</label>
                                    <input name="phoneNum" type="tel" value={formData.phoneNum} onChange={handleChange} placeholder="010-0000-0000" required className="w-full p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium">주소</label>
                                    <div className="flex gap-2 items-center">
                                        <input name="address" type="text" value={formData.address} onChange={handleChange} required readOnly={!mapError} className={`flex-1 p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] ${mapError ? 'bg-white' : 'bg-slate-100 text-slate-600'}`} placeholder={mapError ? "주소를 직접 입력해주세요" : "주소 검색 버튼을 눌러주세요"} />
                                        <button type="button" onClick={handleSearchAddress} className="px-5 py-[14px] rounded-[8px] border border-[#1D3130] text-[#1D3130] font-medium hover:bg-slate-50 transition-colors whitespace-nowrap text-[14px]" disabled={!isMapLoaded && !mapError}>
                                            {isMapLoaded ? "주소 검색" : mapError ? "수동 입력" : "로딩 중..."}
                                        </button>
                                    </div>
                                    {mapError && <div className="text-red-500 text-[13px] mt-1">지도 서비스를 불러올 수 없습니다. 주소를 직접 입력해주세요.</div>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-slate-700 font-medium flex items-center justify-between">
                                        주민번호 (7자리)
                                        <span className="text-[12px] text-slate-400 font-normal">* 실명 인증 및 정산용</span>
                                    </label>
                                    <input name="rrn" type="text" value={formData.rrn} onChange={handleChange} placeholder="900101-1" required className="w-full p-[14px] border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#89B18A] focus:ring-1 focus:ring-[#89B18A] transition-all text-[15px] bg-slate-50 focus:bg-white" />
                                </div>
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-[14px] font-medium text-center bg-red-50 p-3 rounded-lg mb-4">{error}</div>}

                        {/* Divider */}
                        <hr className="my-8 border-slate-100" />

                        {/* Submit Button */}
                        <div className="flex justify-center mt-4">
                            <button type="submit" className="w-fit px-12 py-[16px] bg-[#3B5240] text-white rounded-full font-bold text-[17px] hover:bg-[#2d4031] transition-colors shadow-lg shadow-[#3B5240]/10 active:scale-[0.98]">
                                가입하기
                            </button>
                        </div>

                    </form>
                </div>
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
            <Modal
                isOpen={showErrorModal}
                title="회원가입 실패"
                message={errorModalMessage}
                onConfirm={() => setShowErrorModal(false)}
            />
        </div >
    );
};

export default SignupPage;
