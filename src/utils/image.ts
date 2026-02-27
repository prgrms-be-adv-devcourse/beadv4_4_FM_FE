export const getProfileImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://team07-mossy-storage.s3.ap-northeast-2.amazonaws.com/profile/default-user.png';
    if (url === 'default-user' || url.includes('default-profile')) return 'https://team07-mossy-storage.s3.ap-northeast-2.amazonaws.com/profile/default-user.png';
    if (url === 'default-seller') return 'https://team07-mossy-storage.s3.ap-northeast-2.amazonaws.com/profile/default-seller.png';
    return url;
};

export const isDefaultProfile = (url: string | null | undefined): boolean => {
    if (!url) return true;
    if (url === 'default-user' || url.includes('default-profile') || url === 'default-seller') return true;
    return false;
};
