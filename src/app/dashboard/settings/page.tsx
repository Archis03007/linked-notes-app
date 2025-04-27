"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import colors from "tailwindcss/colors";
import { Check, Plus, Menu } from "lucide-react";

// Build tailwind color list
const COLOR_VARIANTS = ["500"] as const;
const COLOR_NAMES = Object.keys(colors).filter(
  (key) => typeof (colors as any)[key] === "object"
) as string[];
const TAILWIND_COLORS = COLOR_NAMES.flatMap((name) =>
  COLOR_VARIANTS.map((v) => `${name}-${v}`)
);
const COLOR_MAP: Record<string, string> = TAILWIND_COLORS.reduce((map, key) => {
  const [name, variant] = key.split("-") as [string, string];
  const hex = (colors as any)[name]?.[variant];
  if (hex) map[key] = hex;
  return map;
}, {} as Record<string, string>);

export default function SettingsPage() {
  const { username } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<'personal' | 'tags'>('personal');
  const [nameInput, setNameInput] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAILWIND_COLORS[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [loadingTag, setLoadingTag] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect route
  useEffect(() => {
    if (username === '') router.replace('/login');
  }, [username, router]);

  // Load profile name
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      const name = profile?.name || user.user_metadata?.name || '';
      setDisplayName(name);
      setNameInput(name);
    }
    loadProfile();
  }, []);

  // Load tags
  useEffect(() => {
    async function loadTags() {
      const { data } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('created_at', { ascending: true });
      setTags(data || []);
    }
    loadTags();
  }, []);

  // Save personal name
  const saveName = async () => {
    setSavingName(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.auth.updateUser({ data: { name: nameInput } });
    await supabase.from('profiles').upsert({
      id: user.id,
      name: nameInput,
      email: user.email,
      updated_at: new Date().toISOString(),
    });
    setDisplayName(nameInput);
    setSavingName(false);
  };

  // Create or update tag
  const saveTag = async () => {
    setLoadingTag(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (editingTagId) {
      await supabase
        .from('tags')
        .update({ name: tagName, color: tagColor })
        .eq('id', editingTagId);
    } else if (user) {
      await supabase.from('tags').insert({
        name: tagName,
        color: tagColor,
        user_id: user.id,
      });
    }
    setTagName('');
    setTagColor(TAILWIND_COLORS[0]);
    setEditingTagId(null);
    const { data: newTags } = await supabase
      .from('tags')
      .select('id, name, color')
      .order('created_at', { ascending: true });
    setTags(newTags || []);
    setLoadingTag(false);
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    setLoadingTag(true);
    await supabase.from('tags').delete().eq('id', id);
    const { data: newTags } = await supabase
      .from('tags')
      .select('id, name, color')
      .order('created_at', { ascending: true });
    setTags(newTags || []);
    setLoadingTag(false);
  };

  const startEdit = (tag: any) => {
    setTagName(tag.name);
    setTagColor(tag.color);
    setEditingTagId(tag.id);
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100">
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-zinc-900 text-gray-100 shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col pt-8 px-4 gap-2 shadow-xl transition-transform duration-200
          md:relative md:translate-x-0 md:flex md:min-h-screen md:max-h-screen md:sticky md:top-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <span className="text-xl font-bold">Settings</span>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>
        <button
          className={`w-full text-left px-3 py-2 rounded transition-colors ${section==='personal'? 'bg-zinc-800 text-zinc-100':'text-zinc-300 hover:bg-zinc-800'}`}
          onClick={()=>{setSection('personal'); setSidebarOpen(false);}}
        >
          Personal
        </button>
        <button
          className={`w-full text-left px-3 py-2 rounded transition-colors ${section==='tags' ? 'bg-zinc-800 text-zinc-100':'text-zinc-300 hover:bg-zinc-800'}`}
          onClick={()=>{setSection('tags'); setSidebarOpen(false);}}
        >
          Manage Tags
        </button>
      </aside>
      {/* Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        {section==='personal' ? (
          <div className="mx-auto max-w-2xl flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Personal</h1>
            <label className="text-sm text-zinc-200">Display Name</label>
            <input
              className="border-b border-zinc-600 bg-transparent px-2 py-1 text-lg focus:outline-none placeholder-zinc-400"
              value={nameInput}
              onChange={e=>setNameInput(e.target.value)}
              placeholder="Your name"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                onClick={saveName}
                disabled={!nameInput.trim()||savingName}
              >Save</button>
              <button
                className="px-4 py-2 text-zinc-400"
                onClick={()=>router.back()}
                disabled={savingName}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl flex flex-col gap-8">
            <h1 className="text-2xl font-bold">Manage Tags</h1>
            <form className="flex flex-col gap-4" onSubmit={e=>{e.preventDefault();saveTag()}}>
              <input
                className="border-b border-zinc-600 bg-transparent px-2 py-1 focus:outline-none placeholder-zinc-400"
                value={tagName}
                onChange={e=>setTagName(e.target.value)}
                placeholder="Tag name"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-zinc-300 mr-2">Color:</span>
                {TAILWIND_COLORS.map(color=>(
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${tagColor===color?'ring-2 ring-zinc-100':''}`}
                    style={{backgroundColor:COLOR_MAP[color]}}
                    onClick={()=>setTagColor(color)}
                  >{tagColor===color&&<Check className="w-4 h-4 text-zinc-100"/>}</button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button type="submit" className="bg-violet-600 px-4 py-2 rounded hover:bg-violet-700" disabled={!tagName.trim()}>
                  {editingTagId?'Update Tag':'Add Tag'}
                </button>
                {editingTagId&&(
                  <button type="button" className="text-zinc-400 px-4 py-2" onClick={()=>{setEditingTagId(null);setTagName('');}}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
            <ul className="flex flex-col gap-2">
              {tags.map(t=>(
                <li key={t.id} className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor:COLOR_MAP[t.color]}} />
                  <span className="flex-1 truncate">{t.name}</span>
                  <button className="text-blue-400 text-xs hover:underline" onClick={()=>startEdit(t)}>Edit</button>
                  <button className="text-red-400 text-xs hover:underline ml-2" onClick={()=>deleteTag(t.id)}>Delete</button>
                </li>
              ))}
              {tags.length===0&&<li className="text-zinc-500 text-sm">No tags yet.</li>}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
} 