import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi, type MeResponse } from '../../api/member';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import Modal from '../../components/Modal';

interface ProfileEditPageProps {
    initialEmail?: string;
}

const ProfileEditPage = ({ initialEmail }: ProfileEditPageProps) => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');

    const [phoneNum, setPhoneNum] = useState('');
    const [rrn, setRrn] = useState('');
    const [nickname, setNickname] = useState('');

    const openPostcode = useDaumPostcodePopup();

    const [profileStep, setProfileStep] = useState<'menu' | 'verify' | 'edit' | 'social'>('menu');
    const [verifiedPassword, setVerifiedPassword] = useState('');

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await memberApi.getMe();
                if (res && res.data && typeof res.data === 'object') {
                    const data = res.data as any;
                    setUserInfo(data);
                    setRrn(data.rrn ? data.rrn.split('-')[0] : '');
                    setPhoneNum(data.phoneNum || '');
                    setNickname(data.nickname || '');
                    if (data.address) {
                        const commaIndex = data.address.indexOf(',');
                        if (commaIndex !== -1) {
                            setAddress1(data.address.substring(0, commaIndex).trim());
                            setAddress2(data.address.substring(commaIndex + 1).trim());
                        } else {
                            setAddress1(data.address);
                        }
                    }
                } else if (typeof res === 'object' && res !== null && !('data' in res)) {
                    // Fallback just in case backend format changed directly
                    const data = res as any;
                    setUserInfo(data);
                    setRrn(data.rrn ? data.rrn.split('-')[0] : '');
                    setPhoneNum(data.phoneNum || '');
                    setNickname(data.nickname || '');
                }
            } catch (err) {
                console.error("Failed to fetch user info", err);
                alert("인증 정보가 없습니다. 다시 로그인해주세요.");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, [navigate]);

    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

    const handleCompletePostcode = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }
        setAddress1(fullAddress);

        if ((window as any).kakao && (window as any).kakao.maps && (window as any).kakao.maps.services) {
            const geocoder = new (window as any).kakao.maps.services.Geocoder();
            geocoder.addressSearch(fullAddress, (result: any, status: any) => {
                if (status === (window as any).kakao.maps.services.Status.OK) {
                    setLatitude(parseFloat(result[0].y));
                    setLongitude(parseFloat(result[0].x));
                }
            });
        }
    };

    const handleClickPostcode = () => {
        openPostcode({ onComplete: handleCompletePostcode });
    };

    const handleVerifyPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) return alert("비밀번호를 입력해주세요.");

        // Save the entered password to state and proceed to edit screen
        setVerifiedPassword(currentPassword);
        setProfileStep('edit');
    };

    const handleUpdateAll = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Password
        if (newPassword || newPasswordConfirm || userInfo?.hasPassword === false) {
            if (newPassword !== newPasswordConfirm) return alert("새 비밀번호가 일치하지 않습니다.");

            // if social user trying to save profile without setting password
            if (userInfo?.hasPassword === false && !newPassword) {
                return alert("소셜 연동 계정은 개인정보를 수정하기 전 반드시 인증용 새 비밀번호를 설정해야 합니다.");
            }

            try {
                if (userInfo?.hasPassword) {
                    await memberApi.changePassword({ currentPassword: verifiedPassword, newPassword });
                } else {
                    await memberApi.setPassword({ newPassword });
                    setUserInfo(prev => prev ? { ...prev, hasPassword: true } : prev);
                }
            } catch (err: any) {
                return alert(err.response?.data?.msg || "비밀번호 처리에 실패했습니다.");
            }
        }

        // 2. Profile Details
        const fullAddress = address2 ? `${address1}, ${address2}` : address1;
        try {
            await memberApi.updateProfile({
                nickname: nickname || userInfo?.nickname || 'User',
                phoneNum: phoneNum || '',
                address: fullAddress || '',
                rrn: rrn || '',
                latitude: latitude,
                longitude: longitude,
            });
            setModalConfig({
                isOpen: true,
                title: '회원정보 수정',
                message: '회원정보가 성공적으로 수정되었습니다.',
                onConfirm: () => {
                    closeModal();
                    setNewPassword('');
                    setNewPasswordConfirm('');
                    if (newPassword) setVerifiedPassword(newPassword);
                }
            });
        } catch (err: any) {
            alert(err.response?.data?.msg || "정보 변경에 실패했습니다.");
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>로딩 중...</div>;

    if (!userInfo) return null;

    const renderMenu = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '0', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>개인정보</div>
                <div
                    onClick={() => {
                        if (userInfo.hasPassword === false) setProfileStep('edit');
                        else setProfileStep('verify');
                    }}
                    style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>개인 정보 수정</span>
                    <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>›</span>
                </div>
                <div
                    onClick={() => {
                        setProfileStep('social');
                    }}
                    style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>소셜 로그인 연동하기</span>
                    <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>›</span>
                </div>
            </div>
        </div>
    );

    const renderVerify = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setProfileStep('menu')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', padding: '0' }}>‹</button>
                <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#1e293b' }}>개인 정보 수정</h2>
            </div>

            <div className="card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700, color: '#1e293b' }}>비밀번호 재확인</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #1e293b' }}>
                    회원님의 정보를 안전하게 보호하기 위해 비밀번호를 다시 한번 확인해주세요.
                </p>

                <form onSubmit={handleVerifyPassword}>
                    <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <div style={{ width: '120px', fontWeight: 600, color: '#475569' }}>이메일</div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                className="form-control"
                                value={initialEmail || (userInfo.username?.startsWith('kakao_') || userInfo.username?.startsWith('google_')
                                    ? `[소셜 로그인] ${userInfo.username}`
                                    : (userInfo.username || ''))}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                                    backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b',
                                    cursor: 'not-allowed', boxSizing: 'border-box'
                                }}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '2.5rem', alignItems: 'center' }}>
                        <div style={{ width: '120px', fontWeight: 600, color: '#475569' }}>비밀번호<span style={{ color: 'red', marginLeft: '2px' }}>*</span></div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="password"
                                className="form-control"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="현재 비밀번호를 입력해주세요"
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '200px', padding: '0.75rem', fontSize: '1.05rem', fontWeight: 600 }}>확인</button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderEdit = () => {
        const isSocial = userInfo?.hasPassword === false;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => setProfileStep('menu')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', padding: '0' }}>‹</button>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#1e293b' }}>개인 정보 수정</h2>
                </div>

                <div className="card" style={{ padding: '0', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                    <div style={{ borderBottom: '2px solid #1e293b', margin: '1.5rem 2.5rem' }}></div>

                    <form onSubmit={handleUpdateAll} style={{ padding: '0 2.5rem 2.5rem 2.5rem' }}>

                        {/* ID */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569' }}>아이디</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={userInfo?.username?.startsWith('kakao_') || userInfo?.username?.startsWith('google_')
                                        ? `[소셜 로그인] ${userInfo?.username}`
                                        : (userInfo?.username || '')}
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', boxSizing: 'border-box' }}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Current Password Visual Mimic */}
                        {!isSocial && (
                            <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '140px', fontWeight: 600, color: '#475569' }}>현재 비밀번호</div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="비밀번호 확인 완료"
                                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', boxSizing: 'border-box' }}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        )}

                        {/* New Password */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569', marginTop: '0.8rem' }}>새 비밀번호</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="새 비밀번호를 입력해 주세요"
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box' }}
                                />
                                {isSocial && !newPassword && (
                                    <div style={{ color: '#ea580c', fontSize: '0.85rem', marginTop: '0.5rem' }}>* 소셜 연동 계정입니다. 안전한 개인정보 보안을 위해 비밀번호를 함께 설정해주세요.</div>
                                )}
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569', marginTop: '0.8rem' }}>새 비밀번호 확인</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPasswordConfirm}
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                    placeholder="새 비밀번호를 다시 입력해 주세요"
                                    style={{
                                        width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                                        border: newPasswordConfirm && newPassword !== newPasswordConfirm ? '1px solid #ef4444' : '1px solid #e2e8f0',
                                        backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box'
                                    }}
                                />
                                {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                        비밀번호가 일치하지 않습니다.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name / Nickname */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569' }}>이름 (닉네임)</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="사용하실 이름을 입력해주세요"
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569' }}>이메일</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={initialEmail || ''}
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', boxSizing: 'border-box' }}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Birth Date / RRN */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569', marginTop: '0.8rem' }}>생년월일</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={rrn}
                                    onChange={(e) => setRrn(e.target.value)}
                                    maxLength={6}
                                    placeholder="생년월일 6자리 (예: 900101)"
                                    style={{
                                        width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                                        backgroundColor: userInfo?.rrn ? '#f1f5f9' : '#ffffff',
                                        color: userInfo?.rrn ? '#64748b' : '#1e293b',
                                        cursor: userInfo?.rrn ? 'not-allowed' : 'text',
                                        boxSizing: 'border-box'
                                    }}
                                    readOnly={!!userInfo?.rrn}
                                />
                                {!userInfo?.rrn && (
                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>* 생년월일이 등록되어 있지 않습니다. 위 형식에 맞게 입력해주세요.</div>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569' }}>휴대폰</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={phoneNum}
                                    onChange={(e) => setPhoneNum(e.target.value)}
                                    placeholder="010-0000-0000"
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{ display: 'flex', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '140px', fontWeight: 600, color: '#475569', marginTop: '0.8rem' }}>주소</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={address1}
                                        placeholder="기본 주소"
                                        style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', boxSizing: 'border-box', cursor: 'not-allowed' }}
                                        readOnly
                                        disabled
                                    />
                                    <button type="button" className="btn btn-outline" onClick={handleClickPostcode} style={{ whiteSpace: 'nowrap', padding: '0.8rem 1rem', borderRadius: '8px', fontWeight: 600 }}>
                                        주소 검색
                                    </button>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={address2}
                                        onChange={(e) => setAddress2(e.target.value)}
                                        placeholder="상세 주소를 입력해주세요"
                                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                            <button type="button" style={{
                                padding: '1rem 3rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                                borderRadius: '8px', color: '#475569', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
                            }}>
                                탈퇴하기
                            </button>
                            <button type="submit" style={{
                                padding: '1rem 3rem', backgroundColor: 'var(--primary-color)', border: 'none',
                                borderRadius: '8px', color: '#ffffff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', flex: 1, marginLeft: '1rem'
                            }}>
                                회원정보수정
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        );
    };

    const renderSocial = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => setProfileStep('menu')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', padding: '0' }}>‹</button>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#1e293b' }}>소셜 로그인 연동하기</h2>
                </div>

                <div className="card" style={{ padding: '0', backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                    <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>연동 관리</div>

                    {/* 카카오 연동 */}
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#FEE500', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 2C4.029 2 0 5.15 0 9.038c0 2.508 1.637 4.706 4.12 5.922-.142.482-.519 1.83-.553 1.968-.043.167.06.162.128.118.053-.035 1.705-1.144 2.39-1.613.626.084 1.258.125 1.915.125 4.971 0 9-3.15 9-7.038C18 5.15 13.971 2 9 2z" fill="#000000" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>카카오</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                                    {userInfo?.username?.startsWith('kakao_') ? '연동됨' : '연동 안 됨'}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (userInfo?.username?.startsWith('kakao_')) {
                                    alert('이미 연동되어 있습니다. 연동 해제는 준비 중입니다.');
                                } else {
                                    document.cookie = `linkToken=${localStorage.getItem('accessToken')}; path=/; max-age=300;`;
                                    window.location.href = 'http://localhost:8086/oauth2/authorization/kakao';
                                }
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: userInfo?.username?.startsWith('kakao_') ? '1px solid #e2e8f0' : 'none',
                                backgroundColor: userInfo?.username?.startsWith('kakao_') ? '#ffffff' : '#f1f5f9',
                                color: userInfo?.username?.startsWith('kakao_') ? '#64748b' : '#475569',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {userInfo?.username?.startsWith('kakao_') ? '해제' : '연동'}
                        </button>
                    </div>

                    {/* 구글 연동 */}
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                                    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
                                    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
                                    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Google</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                                    {userInfo?.username?.startsWith('google_') ? '연동됨' : '연동 안 됨'}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (userInfo?.username?.startsWith('google_')) {
                                    alert('이미 연동되어 있습니다. 연동 해제는 준비 중입니다.');
                                } else {
                                    document.cookie = `linkToken=${localStorage.getItem('accessToken')}; path=/; max-age=300;`;
                                    window.location.href = 'http://localhost:8086/oauth2/authorization/google';
                                }
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: userInfo?.username?.startsWith('google_') ? '1px solid #e2e8f0' : 'none',
                                backgroundColor: userInfo?.username?.startsWith('google_') ? '#ffffff' : '#f1f5f9',
                                color: userInfo?.username?.startsWith('google_') ? '#64748b' : '#475569',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {userInfo?.username?.startsWith('google_') ? '해제' : '연동'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', textAlign: 'left', fontWeight: 700, letterSpacing: '-0.02em', color: '#1e293b', display: profileStep === 'menu' ? 'block' : 'none' }}>
                내 정보 설정
            </h1>

            {profileStep === 'menu' && renderMenu()}
            {profileStep === 'verify' && renderVerify()}
            {profileStep === 'edit' && renderEdit()}
            {profileStep === 'social' && renderSocial()}

            <Modal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    );
};

export default ProfileEditPage;
