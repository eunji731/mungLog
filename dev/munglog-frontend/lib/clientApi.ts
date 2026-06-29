export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export const getImagePath = (path?: string, subfolder: 'daily' | 'profiles' = 'daily'): string => {
  if (!path) return '/logo_simple.png';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  if (path.startsWith('/files/') || path.startsWith('/uploads/')) return `${BACKEND_URL}${path}`;
  if (path.includes('/')) return `${BACKEND_URL}/files/${path}`;
  return `${BACKEND_URL}/uploads/${subfolder}/${path}`;
};

export const toFileUrl = (storedPath: string): string =>
  `${BACKEND_URL}/files/${storedPath}`;
