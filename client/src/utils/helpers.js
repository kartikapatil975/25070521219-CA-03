/**
 * Utility helper functions for ReadSphere
 */

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const calculatePace = (pages, minutes) => {
  if (!pages || !minutes || minutes === 0) return 0;
  return Math.round((pages / minutes) * 60);
};

export const GENRE_PALETTE = {
  Fiction: '#2D6A4F',
  'Non-Fiction': '#1B4332',
  'Sci-Fi': '#2563EB',
  Fantasy: '#7C3AED',
  Mystery: '#9333EA',
  Biography: '#D97706',
  'Self-Help': '#059669',
  Philosophy: '#C026D3',
  History: '#B45309',
  Technology: '#0284C7',
  Business: '#0D9488',
  Poetry: '#DB2777',
  Default: '#475569',
};

export const getGenreColor = (genre) => {
  return GENRE_PALETTE[genre] || GENRE_PALETTE.Default;
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Completed',
      };
    case 'Currently Reading':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Reading',
      };
    case 'Want to Read':
    default:
      return {
        bg: 'bg-stone-100 text-stone-700 border-stone-200',
        dot: 'bg-stone-400',
        label: 'Want to Read',
      };
  }
};

export const DEFAULT_BOOK_COVERS = {
  Fiction: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
  'Non-Fiction': 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80',
  'Sci-Fi': 'https://images.unsplash.com/photo-1618609377864-68609b857e90?w=400&auto=format&fit=crop&q=80',
  Fantasy: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
  Biography: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop&q=80',
  'Self-Help': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
  Philosophy: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&auto=format&fit=crop&q=80',
  Technology: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400&auto=format&fit=crop&q=80',
  Default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
};

export const getBookCover = (coverImage, genre) => {
  if (coverImage && coverImage.trim()) return coverImage;
  return DEFAULT_BOOK_COVERS[genre] || DEFAULT_BOOK_COVERS.Default;
};

