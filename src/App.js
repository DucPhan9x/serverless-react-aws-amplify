import React, { useEffect, useState } from "react";
import { withAuthenticator } from "aws-amplify-react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

function App() {
  const [noteId, setNoteId] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  function handleChangeNote(event) {
    setNote(event.target.value);
  }

  useEffect(() => {
    setLoading(true);
    async function getListNotes() {
      const result = await API.graphql(graphqlOperation(listNotes));
      setLoading(false);
      setNotes(result.data.listNotes.items);
    }
    getListNotes();
  }, []);

  function hasExistingNote() {
    if (noteId) {
      const isNote = notes.findIndex((note) => note.id === noteId) > -1;
      return isNote;
    }
    return false;
  }
  async function handleAddNote(event) {
    event.preventDefault();
    if (note) {
      if (hasExistingNote()) {
        handleUpdateNote();
      } else {
        setLoading(true);
        const input = { note };
        const result = await API.graphql(
          graphqlOperation(createNote, { input })
        );
        setLoading(false);
        const newNote = result.data.createNote;
        setNotes([...notes, newNote]);
        setNote("");
      }
    } else {
      alert("Note empty!");
    }
  }

  async function handleDeleteNote(noteId) {
    setLoading(true);
    const input = { id: noteId };
    const result = await API.graphql(graphqlOperation(deleteNote, { input }));
    setLoading(false);
    const deletedNote = result.data.deleteNote;
    setNotes(notes.filter((note) => note.id !== deletedNote.id));
  }

  function handleSetNote(note) {
    setNoteId(note.id);
    setNote(note.note);
  }

  async function handleUpdateNote() {
    setLoading(true);
    const input = { id: noteId, note: note };
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex((note) => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1),
    ];
    setNotes(updatedNotes);
    handleSetNote({ id: "", note: "" });
    setLoading(false);
  }

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Notebook</h1>
      {/* Note Form */}
      <form className="mb3" onSubmit={handleAddNote}>
        <input
          type="text"
          className="pa2 f4"
          placeholder="Write your note"
          onChange={handleChangeNote}
          value={note}
        />

        <button className="pa2 f4 pointer" type="submit" disabled={loading}>
          {!noteId ? "Add Note" : "Update Note"}
        </button>
      </form>
      {/* Note List */}
      <div>
        {!loading ? (
          notes.map((item) => {
            return (
              <div key={item.id} className="flex items-center">
                <li
                  className="list pa1 f3 pointer"
                  onClick={() => handleSetNote(item)}
                >
                  {item.note}
                </li>
                <button
                  onClick={() => handleDeleteNote(item.id)}
                  className="bg-transparent bn f4 pointer dim"
                >
                  <span>&times;</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex items-center">Loading notes ...</div>
        )}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
