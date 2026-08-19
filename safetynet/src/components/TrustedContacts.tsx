"use client";

import { useSafetyContext } from "@/context/SafetyContext";
import { Users, Plus, Trash2, Phone, Mail } from "lucide-react";
import { useState } from "react";

export default function TrustedContacts() {
  const { contacts, addContact, removeContact } = useSafetyContext();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!phone && !email)) return;
    addContact({ id: Date.now().toString(), name, phone, email });
    setName("");
    setPhone("");
    setEmail("");
    setIsAdding(false);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 shadow-sm text-foreground mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="text-blue-500" /> Trusted Contacts
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors font-medium"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl mb-4 space-y-3 border border-black/10 dark:border-white/10">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
             className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!name || (!phone && !email)}
              className="flex-1 bg-blue-600 disabled:bg-blue-400 text-white py-2 rounded-md text-sm font-medium"
            >
              Save Contact
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {contacts.length === 0 && !isAdding ? (
        <div className="text-center py-6 text-sm opacity-60">
          No trusted contacts added yet. Add one to enable one-tap SOS sharing.
        </div>
      ) : (
        <ul className="space-y-3">
          {contacts.map((c) => (
            <li key={c.id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <div className="flex gap-3 mt-1 text-xs opacity-70">
                  {c.phone && <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>}
                  {c.email && <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>}
                </div>
              </div>
              <button
                onClick={() => removeContact(c.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Remove contact"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
