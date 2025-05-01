import { Note } from '@/types/note';

const NOTES_CACHE_KEY = 'notes_cache';
const NOTES_CACHE_TIMESTAMP_KEY = 'notes_cache_timestamp';

export const saveNotesToCache = (notes: Note[]) => {
  try {
    localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(notes));
    localStorage.setItem(NOTES_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving notes to cache:', error);
  }
};

export const getNotesFromCache = (): { notes: Note[] | null; timestamp: number } => {
  try {
    const cachedNotes = localStorage.getItem(NOTES_CACHE_KEY);
    const timestamp = parseInt(localStorage.getItem(NOTES_CACHE_TIMESTAMP_KEY) || '0', 10);
    
    if (!cachedNotes) {
      return { notes: null, timestamp: 0 };
    }

    return {
      notes: JSON.parse(cachedNotes),
      timestamp
    };
  } catch (error) {
    console.error('Error reading notes from cache:', error);
    return { notes: null, timestamp: 0 };
  }
};

export const clearNotesCache = () => {
  try {
    localStorage.removeItem(NOTES_CACHE_KEY);
    localStorage.removeItem(NOTES_CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing notes cache:', error);
  }
}; 