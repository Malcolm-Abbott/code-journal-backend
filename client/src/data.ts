export type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

export async function readEntries() {
  try {
    const res = await fetch('/api/entries');
    if (!res.ok) throw new Error('Response connection not OK');
    const result = await res.json();
    return result;
  } catch (err) {
    console.log(err);
  }
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  try {
    const res = await fetch(`/api/entries/${entryId}`);
    if (!res.ok) throw new Error('Response connection not OK');
    const result = await res.json();
    return result;
  } catch (err) {
    console.log(err);
  }
}

export async function addEntry(entry: Entry): Promise<Entry | undefined> {
  try {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Response connection not OK');
    const result = await res.json();
    return result;
  } catch (err) {
    console.log(err);
  }
}

export async function updateEntry(entry: Entry): Promise<Entry | undefined> {
  try {
    const res = await fetch(`/api/entries/${entry.entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Res connection not OK');
    const result = await res.json();
    return result;
  } catch (err) {
    console.log(err);
  }
}

export async function removeEntry(entryId: number): Promise<void> {
  try {
    const res = await fetch(`/api/entries/${entryId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('This is not OK');
  } catch (err) {
    console.log(err);
  }
}
