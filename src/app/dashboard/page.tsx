"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/utils/supabaseClient";
import Sidebar from "@/components/dashboard/Sidebar";
import UserGreeting from "@/components/dashboard/UserGreeting";
import SearchBar from "@/components/dashboard/SearchBar";
import CreateNoteButton from "@/components/dashboard/CreateNoteButton";
import NotesList from "@/components/dashboard/NotesList";
import NoteEditor from "@/components/dashboard/NoteEditor";
import CreateNoteForm from "@/components/dashboard/CreateNoteForm";
import Modal from "@/components/Modal";
import TagSelectorModal from "@/components/dashboard/TagSelectorModal";
import { useAuth } from "@/components/AuthProvider";

interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  created_at: string;
}

const TAILWIND_COLORS = [
  "red-500", "orange-500", "yellow-500", "green-500", "teal-500", "blue-500", "indigo-500", "purple-500", "pink-500", "gray-500"
];

const COLOR_MAP: Record<string, string> = {
  "red-500": "#ef4444",
  "orange-500": "#f59e42",
  "yellow-500": "#eab308",
  "green-500": "#22c55e",
  "teal-500": "#14b8a6",
  "blue-500": "#3b82f6",
  "indigo-500": "#6366f1",
  "purple-500": "#a21caf",
  "pink-500": "#ec4899",
  "gray-500": "#6b7280"
};

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", subtitle: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'personal' | 'tags'>('personal');
  const [tags, setTags] = useState<any[]>([]);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(TAILWIND_COLORS[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagLoading, setTagLoading] = useState(false);
  const [newNoteTagIds, setNewNoteTagIds] = useState<string[]>([]);
  const [editNoteTagIds, setEditNoteTagIds] = useState<string[]>([]);
  const [showNewNoteTagSelector, setShowNewNoteTagSelector] = useState(false);
  const [showEditNoteTagSelector, setShowEditNoteTagSelector] = useState(false);
  const router = useRouter();
  const tagUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const { username } = useAuth();

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
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, subtitle, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setNotes(data);
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
          setNameInput(profile.name);
        } else {
          setDisplayName(data.user.user_metadata?.name || "");
          setNameInput(data.user.user_metadata?.name || "");
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
  }, [user, settingsOpen]);

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
      // Optional: If you want to change the URL without full page reload
      // router.push(`/dashboard?note=${foundNote.id}`, { scroll: false });
    } else {
      console.log('Note not found for title:', title);
      // Optionally show a notification
      alert('Note with title "' + title + '" not found.');
    }
  };

  const handleCreateNote = () => {
    setCreating(true);
    setSelectedNote(null);
    setNewNote({ title: "", subtitle: "", content: "" });
    setError(null);
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
    setNotes([data, ...notes]);
    setNewNote({ title: "", subtitle: "", content: "" });
    setNewNoteTagIds([]);
    setSaving(false);
  };

  const handleSaveName = async () => {
    if (!user) return;
    setNameSaving(true);
    await supabase.auth.updateUser({ data: { name: nameInput } });
    await supabase.from("profiles").upsert({
      id: user.id,
      name: nameInput,
      email: user.email,
      updated_at: new Date().toISOString(),
    });
    setDisplayName(nameInput);
    setEditingName(false);
    setNameSaving(false);
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    setUpdating(true);
    setUpdateError(null);
    const { error } = await supabase
      .from("notes")
      .update({
        title: selectedNote.title,
        subtitle: selectedNote.subtitle,
        content: selectedNote.content,
      })
      .eq("id", selectedNote.id);
    if (error) {
      setUpdateError(error.message);
    } else {
      setNotes(notes.map(n => n.id === selectedNote.id ? { ...selectedNote } : n));
    }
    setUpdating(false);
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    } else {
      alert("Failed to delete note: " + error.message);
    }
  };

  const handleCreateOrUpdateTag = async () => {
    setTagLoading(true);
    if (editingTagId) {
      // Update tag
      await supabase.from("tags").update({ name: tagName, color: tagColor }).eq("id", editingTagId);
    } else {
      // Create tag
      await supabase.from("tags").insert({ name: tagName, color: tagColor, user_id: user.id });
    }
    setTagName("");
    setTagColor(TAILWIND_COLORS[0]);
    setEditingTagId(null);
    // Refresh tags
    const { data } = await supabase.from("tags").select("id, name, color").eq("user_id", user.id).order("created_at", { ascending: true });
    setTags(data || []);
    setTagLoading(false);
  };

  const handleEditTag = (tag: any) => {
    setTagName(tag.name);
    setTagColor(tag.color);
    setEditingTagId(tag.id);
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm("Delete this tag?")) return;
    setTagLoading(true);
    await supabase.from("tags").delete().eq("id", id);
    const { data } = await supabase.from("tags").select("id, name, color").eq("user_id", user.id).order("created_at", { ascending: true });
    setTags(data || []);
    setTagLoading(false);
  };

  // Filter notes by search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)}>
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
          }}
          loading={loading}
          onDeleteNote={handleDeleteNote}
        />
      </Sidebar>
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        leftPanel={
          <div className="flex flex-col gap-2">
            <button
              className={`text-left px-3 py-2 rounded font-medium transition-colors ${settingsSection === 'personal' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => setSettingsSection('personal')}
            >
              Personal
            </button>
            <button
              className={`text-left px-3 py-2 rounded font-medium transition-colors ${settingsSection === 'tags' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => setSettingsSection('tags')}
            >
              Manage Tags
            </button>
          </div>
        }
        rightPanel={
          settingsSection === 'personal' ? (
            <div className="flex flex-col gap-4 max-w-md">
              <label className="text-sm font-medium">Change your name</label>
              <input
                className="border-b border-gray-400 bg-transparent px-2 py-1 text-lg focus:outline-none"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Enter your name"
                disabled={nameSaving}
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleSaveName}
                  disabled={nameSaving || !nameInput.trim()}
                >
                  {nameSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className="text-gray-500 px-4 py-2"
                  onClick={() => { setNameInput(displayName); setSettingsOpen(false); }}
                  disabled={nameSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-lg">
              <h3 className="text-lg font-semibold mb-2">Manage Tags</h3>
              <form
                className="flex flex-col gap-2"
                onSubmit={e => { e.preventDefault(); handleCreateOrUpdateTag(); }}
              >
                <input
                  className="border-b border-gray-400 bg-transparent px-2 py-1 text-base focus:outline-none"
                  value={tagName}
                  onChange={e => setTagName(e.target.value)}
                  placeholder="Tag name"
                  required
                  disabled={tagLoading}
                />
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Color:</span>
                  <div className="flex gap-1">
                    {TAILWIND_COLORS.map(color => (
                      <button
                        type="button"
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tagColor === color ? 'border-white' : 'border-gray-700'}`}
                        style={{ backgroundColor: COLOR_MAP[color] }}
                        onClick={() => setTagColor(color)}
                        aria-label={color}
                        disabled={tagLoading}
                      >
                        {tagColor === color && <span className="w-3 h-3 rounded-full border-2 border-white block" />}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-violet-600 text-white rounded px-4 py-2 mt-2 hover:bg-violet-700 disabled:opacity-50 self-start"
                  disabled={tagLoading || !tagName.trim()}
                >
                  {editingTagId ? 'Update Tag' : 'Add Tag'}
                </button>
                {editingTagId && (
                  <button
                    type="button"
                    className="text-gray-400 text-xs mt-1 self-start"
                    onClick={() => { setEditingTagId(null); setTagName(""); setTagColor(TAILWIND_COLORS[0]); }}
                    disabled={tagLoading}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
              <ul className="flex flex-col gap-2">
                {tags.map(tag => (
                  <li key={tag.id} className="flex items-center gap-3 group">
                    <span className="w-4 h-4 rounded-full border border-gray-700" style={{ backgroundColor: COLOR_MAP[tag.color] }} />
                    <span className="flex-1 truncate">{tag.name}</span>
                    <button
                      className="text-blue-400 text-xs hover:underline mr-2"
                      onClick={() => handleEditTag(tag)}
                      disabled={tagLoading}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 text-xs hover:underline"
                      onClick={() => handleDeleteTag(tag.id)}
                      disabled={tagLoading}
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {tags.length === 0 && <li className="text-gray-500 text-sm">No tags yet.</li>}
              </ul>
            </div>
          )
        }
      />
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
      <main className="flex-1 p-0 bg-black dark:bg-black overflow-y-auto">
        <div className="w-full flex flex-col gap-6 p-12">
          {creating ? (
            <CreateNoteForm
              newNote={newNote}
              onChange={setNewNote}
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
          ) : selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onChange={(updatedNote) => {
                const fullNote = notes.find(n => n.id === updatedNote.id);
                setSelectedNote(
                  fullNote
                    ? fullNote
                    : { ...selectedNote, ...updatedNote }
                );
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
          ) : (
            <div className="text-gray-600 dark:text-gray-300 text-xl m-auto">Select a note to view or edit.</div>
          )}
        </div>
      </main>
    </div>
  );
} 