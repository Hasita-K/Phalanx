import uuid
from datetime import date as date_type


class JournalEntry:

    # single journal entry 
    def __init__(self, text=None, song_name=None, song_artist=None,
                 song_link=None, song_cover_link=None, entry_date=None, entry_id=None):
        self.id = entry_id or str(uuid.uuid4())
        self.date = entry_date or date_type.today()
        self.text = text
        self.song_name = song_name
        self.song_artist = song_artist
        self.song_link = song_link
        self.song_cover_link = song_cover_link

    def to_dict(self):
        """Serializes to a Firebase/Firestore-friendly dict."""
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "text": self.text,
            "song_name": self.song_name,
            "song_artist": self.song_artist,
            "song_link": self.song_link,
            "song_cover_link": self.song_cover_link,
        }

    @classmethod
    def from_dict(cls, data):
        """Rebuilds a JournalEntry from a Firebase document."""
        return cls(
            text=data.get("text"),
            song_name=data.get("song_name"),
            song_artist=data.get("song_artist"),
            song_link=data.get("song_link"),
            song_cover_link=data.get("song_cover_link"),
            entry_date=date_type.fromisoformat(data["date"]),
            entry_id=data.get("id"),
        )

    def __repr__(self):
        return f"<JournalEntry {self.date.isoformat()} id={self.id[:8]}>"


class UserJournal:
    """Represents a single user's journal — dict of date -> entry_id, plus id -> entry lookup."""

    def __init__(self, user_id):
        self.user_id = user_id
        self.date_index = {}   # date string -> entry_id
        self.entries = {}      # entry_id -> JournalEntry object

    def add_entry(self, entry: JournalEntry):
        date_key = entry.date.isoformat()
        if date_key in self.date_index:
            raise ValueError(f"Entry already exists for {date_key}. Use update_entry instead.")
        self.entries[entry.id] = entry
        self.date_index[date_key] = entry.id
        return entry

    def get_entry_by_date(self, target_date):
        date_key = target_date.isoformat() if hasattr(target_date, "isoformat") else target_date
        entry_id = self.date_index.get(date_key)
        return self.entries.get(entry_id) if entry_id else None

    def get_entry_by_id(self, entry_id):
        return self.entries.get(entry_id)

    def update_entry(self, target_date, **kwargs):
        entry = self.get_entry_by_date(target_date)
        if not entry:
            raise KeyError(f"No entry found for {target_date}")
        for key, value in kwargs.items():
            if hasattr(entry, key):
                setattr(entry, key, value)
        return entry

    def delete_entry(self, target_date):
        date_key = target_date.isoformat() if hasattr(target_date, "isoformat") else target_date
        entry_id = self.date_index.pop(date_key, None)
        if entry_id:
            self.entries.pop(entry_id, None)

    def all_entries(self):
        """Returns entries sorted by date."""
        return sorted(self.entries.values(), key=lambda e: e.date)

    def to_dict(self):
        """Full serialization — useful for pushing this whole journal to Firestore."""
        return {
            "user_id": self.user_id,
            "entries": {eid: entry.to_dict() for eid, entry in self.entries.items()},
            "date_index": self.date_index,
        }

    @classmethod
    def from_dict(cls, data):
        journal = cls(user_id=data["user_id"])
        journal.date_index = data.get("date_index", {})
        journal.entries = {
            eid: JournalEntry.from_dict(edata)
            for eid, edata in data.get("entries", {}).items()
        }
        return journal