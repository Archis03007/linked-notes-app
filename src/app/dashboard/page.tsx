"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/utils/supabaseClient";
import Sidebar from "@/components/dashboard/Sidebar";
import UserGreeting from "@/components/dashboard/UserGreeting";
import SearchBar from "@/components/dashboard/SearchBar";
import CreateNoteButton from "@/components/dashboard/CreateNoteButton";
import NotesList from "@/components/dashboard/NotesList";
import NoteEditor, { EditableNote } from "@/components/dashboard/NoteEditor";
import CreateNoteForm from "@/components/dashboard/CreateNoteForm";
import TagSelectorModal from "@/components/dashboard/TagSelectorModal";
import { useAuth } from "@/components/AuthProvider";
import colors from 'tailwindcss/colors';
import { Check, Plus, Trash2 } from 'lucide-react';
import { saveNotesToCache, getNotesFromCache } from "@/utils/cacheUtils";
import { debounce } from "@/utils/debounce";

interface NewNote {
  title: string;
  subtitle: string;
  content: string;
  type: 'text' | 'task' | 'checklist';
}

interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  created_at: string;
  type: 'text' | 'task' | 'checklist';
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

const COLOR_VARIANTS = ['500'] as const;
const COLOR_NAMES = Object.keys(colors).filter(key => typeof (colors as any)[key] === 'object') as string[];
const TAILWIND_COLORS = COLOR_NAMES.flatMap(name => COLOR_VARIANTS.map(variant => `${name}-${variant}`));
const COLOR_MAP: Record<string, string> = TAILWIND_COLORS.reduce((map, key) => {
  const [name, variant] = key.split('-') as [string, string];
  const hex = (colors as any)[name]?.[variant];
  if (hex) map[key] = hex;
  return map;
}, {} as Record<string, string>);

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState<NewNote>({ 
    title: "", 
    subtitle: "", 
    content: "",
    type: 'text'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<any[]>([]);
  const [newNoteTagIds, setNewNoteTagIds] = useState<string[]>([]);
  const [editNoteTagIds, setEditNoteTagIds] = useState<string[]>([]);
  const [showNewNoteTagSelector, setShowNewNoteTagSelector] = useState(false);
  const [showEditNoteTagSelector, setShowEditNoteTagSelector] = useState(false);
  const router = useRouter();
  const tagUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const { username } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (username === "") {
      router.replace("/login");
    }
  }, [username, router]);

  useEffect(() => {
    const fetchNotes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setNotes([]);
        setLoading(false);
        return;
      }

      // Try to get notes from cache first
      const { notes: cachedNotes } = getNotesFromCache();
      if (cachedNotes) {
        setNotes(cachedNotes);
        setLoading(false);
      }

      // Fetch fresh notes from the database with optimized query
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, subtitle, content, created_at, type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50); // Limit initial load to 50 notes

      if (!error && data) {
        setNotes(data);
        saveNotesToCache(data);
      }
      setLoading(false);
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      // Try to get name from profiles table
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", data.user.id)
          .single();
        if (profile && profile.name) {
          setDisplayName(profile.name);
        } else {
          setDisplayName(data.user.user_metadata?.name || "");
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchTags = async () => {
      const { data } = await supabase.from("tags").select("id, name, color").eq("user_id", user.id).order("created_at", { ascending: true });
      setTags(data || []);
    };
    fetchTags();
  }, [user]);

  useEffect(() => {
    const fetchNoteTags = async () => {
      if (!selectedNote) return setEditNoteTagIds([]);
      const { data } = await supabase
        .from("note_tags")
        .select("tag_id")
        .eq("note_id", selectedNote.id);
      setEditNoteTagIds(data ? data.map((row: any) => row.tag_id) : []);
    };
    fetchNoteTags();
  }, [selectedNote]);

  // Auto-save tags for editing note
  useEffect(() => {
    if (!selectedNote) return;
    if (tagUpdateTimeout.current) clearTimeout(tagUpdateTimeout.current);
    tagUpdateTimeout.current = setTimeout(async () => {
      await supabase.from("note_tags").delete().eq("note_id", selectedNote.id);
      if (editNoteTagIds.length > 0) {
        await supabase.from("note_tags").insert(
          editNoteTagIds.map(tag_id => ({ note_id: selectedNote.id, tag_id }))
        );
      }
    }, 400);
    // Cleanup on unmount
    return () => {
      if (tagUpdateTimeout.current) clearTimeout(tagUpdateTimeout.current);
    };
  }, [editNoteTagIds, selectedNote]);

  // Helper to close sidebar on mobile
  const autoCloseSidebarMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Handler for backlink clicks
  const handleBacklinkClick = (title: string) => {
    console.log('Backlink clicked:', title);
    // Find the note by title (case-insensitive)
    const foundNote = notes.find(n => n.title?.trim().toLowerCase() === title.trim().toLowerCase());

    if (foundNote) {
      console.log('Found note:', foundNote);
      // Select the note to display it in the editor
      setSelectedNote(foundNote);
      setCreating(false); // Ensure we are in edit mode
      autoCloseSidebarMobile();
    } else {
      console.log('Note not found for title:', title);
      // Optionally show a notification
      alert('Note with title "' + title + '" not found.');
    }
  };

  const handleCreateNote = (type: 'text' | 'task' | 'checklist') => {
    setCreating(true);
    setSelectedNote(null);
    let initialContent = "";
    
    // Set initial content based on note type
    switch (type) {
      case 'task':
        initialContent = '<p><input type="checkbox" /> Task description</p>'; // Wrap in <p> for Tiptap
        break;
      case 'checklist':
        // Initialize with one empty item as JSON string
        const initialItems: ChecklistItem[] = [{ id: crypto.randomUUID(), text: "", checked: false }];
        initialContent = JSON.stringify(initialItems);
        break;
      default: // 'text'
        initialContent = "";
    }
    
    setNewNote({ 
      title: "", 
      subtitle: "", 
      content: initialContent,
      type: type 
    });
    setError(null);
    autoCloseSidebarMobile();
  };

  const handleSaveNote = async () => {
    setSaving(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title: newNote.title,
        subtitle: newNote.subtitle,
        content: newNote.content,
        type: newNote.type || 'text',
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    // Insert note_tags
    if (newNoteTagIds.length > 0) {
      await supabase.from("note_tags").insert(
        newNoteTagIds.map(tag_id => ({ note_id: data.id, tag_id }))
      );
    }
    const updatedNotes = [data, ...notes];
    setNotes(updatedNotes);
    saveNotesToCache(updatedNotes);
    setNewNote({ title: "", subtitle: "", content: "", type: 'text' });
    setNewNoteTagIds([]);
    setSaving(false);
  };

  // Memoize the filtered notes to prevent unnecessary recalculations
  const filteredNotes = useMemo(() => 
    notes.filter(note =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.subtitle.toLowerCase().includes(search.toLowerCase())
    ),
    [notes, search]
  );

  // Debounce the update function to reduce database calls
  const debouncedUpdateNote = useCallback(
    debounce(async (note: Note) => {
      setUpdating(true);
      setUpdateError(null);
      
      const contentToSave = typeof note.content === 'string' 
        ? note.content 
        : JSON.stringify(note.content);

      const { error } = await supabase
        .from("notes")
        .update({
          title: note.title,
          subtitle: note.subtitle,
          content: contentToSave,
        })
        .eq("id", note.id);

      if (error) {
        setUpdateError(error.message);
      } else {
        const updatedNotes = notes.map(n => 
          n.id === note.id ? { ...note, content: contentToSave } : n
        );
        setNotes(updatedNotes);
        saveNotesToCache(updatedNotes);
      }
      setUpdating(false);
    }, 1000),
    [notes]
  );

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    debouncedUpdateNote(selectedNote);
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);
    if (!error) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      saveNotesToCache(updatedNotes);
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    } else {
      alert("Failed to delete note: " + error.message);
    }
  };

  // Memoize the selected note to prevent unnecessary re-renders
  const selectedNoteComponent = useMemo(() => {
    if (!selectedNote) return null;
    return (
      <NoteEditor
        note={selectedNote}
        onChange={(updatedPartialNote: Partial<EditableNote>) => { 
          setSelectedNote(prevNote => {
            if (!prevNote) return null;

            let contentToSet = updatedPartialNote.content;
            if (prevNote.type === 'checklist' && contentToSet && typeof contentToSet !== 'string') {
              try {
                contentToSet = JSON.stringify(contentToSet);
              } catch (e) {
                console.error("Error stringifying checklist content during onChange:", e);
                contentToSet = prevNote.content;
              }
            }

            const finalContent = typeof contentToSet === 'string' ? contentToSet : undefined;

            const changes = {
              ...(updatedPartialNote.title !== undefined && { title: updatedPartialNote.title }),
              ...(updatedPartialNote.subtitle !== undefined && { subtitle: updatedPartialNote.subtitle }),
              ...(finalContent !== undefined && { content: finalContent }),
            };

            return { ...prevNote, ...changes } as Note;
          });
        }}
        onUpdate={handleUpdateNote}
        updating={updating}
        updateError={updateError}
        tags={tags}
        selectedTagIds={editNoteTagIds}
        onTagsChange={setEditNoteTagIds}
        colorMap={COLOR_MAP}
        onOpenTagSelector={() => setShowEditNoteTagSelector(true)}
        notes={notes}
        onLinkClick={handleBacklinkClick}
      />
    );
  }, [selectedNote, updating, updateError, tags, editNoteTagIds, notes]);

  return (
    <div className="flex min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <UserGreeting
          displayName={displayName}
          email={user?.email || ""}
        />
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} />
        <CreateNoteButton onClick={handleCreateNote} />
        <NotesList
          notes={filteredNotes}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={note => {
            const fullNote = notes.find(n => n.id === note.id);
            if (fullNote) setSelectedNote(fullNote);
            setCreating(false);
            autoCloseSidebarMobile();
          }}
          loading={loading}
          onDeleteNote={handleDeleteNote}
        />
      </Sidebar>
      <TagSelectorModal
        open={showNewNoteTagSelector}
        onClose={() => setShowNewNoteTagSelector(false)}
        tags={tags}
        selectedTagIds={newNoteTagIds}
        onChange={setNewNoteTagIds}
        colorMap={COLOR_MAP}
      />
      <TagSelectorModal
        open={showEditNoteTagSelector}
        onClose={() => setShowEditNoteTagSelector(false)}
        tags={tags}
        selectedTagIds={editNoteTagIds}
        onChange={setEditNoteTagIds}
        colorMap={COLOR_MAP}
      />
      <main className="flex-1 p-0" style={{ background: 'var(--main-bg)' }}>
        <div className="w-full flex flex-col gap-6 p-12">
          {creating ? (
            <CreateNoteForm
              newNote={newNote}
              onChange={(note: NewNote) => setNewNote(note)}
              onSave={handleSaveNote}
              saving={saving}
              error={error}
              tags={tags}
              selectedTagIds={newNoteTagIds}
              onTagsChange={setNewNoteTagIds}
              colorMap={COLOR_MAP}
              onOpenTagSelector={() => setShowNewNoteTagSelector(true)}
              onLinkClick={handleBacklinkClick}
            />
          ) : selectedNoteComponent || (
            <div className="text-gray-600 dark:text-gray-300 text-xl m-auto">
              Select a note to view or edit.
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 