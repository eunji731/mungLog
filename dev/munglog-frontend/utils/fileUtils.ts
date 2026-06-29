/**
 * 파일 관련 유틸리티
 */

export const isImageFile = (url: string, fileName?: string): boolean => {
  if (!url) return false;

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

  // blob URL은 확장자가 없으므로 반드시 fileName으로 판단
  // 일반 URL은 파일명이 없거나 파일명에 확장자가 없으면 URL 자체 경로에서 추출
  const hasExtension = fileName && fileName.includes('.');
  const nameToCheck = hasExtension ? fileName : (url.startsWith('blob:') ? '' : url);
  const extension = nameToCheck.split('.').pop()?.toLowerCase();

  return extension ? imageExtensions.includes(extension) : false;
};

export const getFileExtension = (url: string, fileName?: string): string => {
  const hasExtension = fileName && fileName.includes('.');
  const nameToCheck = hasExtension ? fileName : url;
  if (!nameToCheck) return '';
  return nameToCheck.split('.').pop()?.toLowerCase() || '';
};

export const getFileNameFromUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('blob:')) return '새 파일';
  const parts = url.split('/');
  const fullName = parts[parts.length - 1];
  return decodeURIComponent(fullName.split('?')[0]); // 인코딩된 한글 처리
};

export const getFileIcon = (extension: string): string => {
  switch (extension) {
    case 'pdf': return '📄';
    case 'xls':
    case 'xlsx': return '📊';
    case 'doc':
    case 'docx': return '📝';
    case 'hwp': return '📒';
    case 'zip':
    case 'rar':
    case '7z': return '📦';
    default: return '📁';
  }
};

/**
 * 파일을 브라우저에서 다운로드한다.
 * Base64 data URL과 일반 URL을 모두 지원한다.
 */
export const downloadFile = async (url: string, fileName: string) => {
  if (!url) return;

  // Base64 데이터 URL인 경우
  if (url.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 일반 URL인 경우 blob으로 변환하여 CORS 우회 다운로드 시도
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed, fallback to opening in new window/tab', error);
    // 폴백: 새 탭에서 열기
    window.open(url, '_blank');
  }
};

