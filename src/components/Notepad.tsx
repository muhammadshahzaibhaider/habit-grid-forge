import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export const Notepad = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("habitTrackerNotes");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    localStorage.setItem("habitTrackerNotes", JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [selectedNoteId]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  const saveNote = () => {
    if (!selectedNoteId) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNoteId
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      )
    );
    toast.success("Note saved");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
    toast.success("Note deleted");
  };

  return (
    <div className="border-2 border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">NOTEPAD</h3>
        <Button size="sm" variant="outline" onClick={createNewNote} className="gap-1 h-7">
          <Plus size={14} />
          New
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <FileText size={24} className="mx-auto mb-2 opacity-50" />
          No notes yet. Create one!
        </div>
      ) : !selectedNoteId ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className="p-2 border border-border rounded cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">{note.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {note.content.slice(0, 50) || "Empty note"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-sm h-8"
            />
            <Button size="sm" onClick={saveNote} className="gap-1 h-8">
              <Save size={14} />
            </Button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here..."
            className="min-h-[120px] text-sm resize-none"
          />
          <div className="flex justify-between">
            <Button size="sm" variant="ghost" onClick={() => setSelectedNoteId(null)} className="text-xs h-7">
              ← Back to notes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteNote(selectedNoteId)}
              className="text-xs h-7 text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
