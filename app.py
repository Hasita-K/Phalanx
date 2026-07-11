import os
import base64
import json
from functools import wraps
from urllib.parse import quote

from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS
from dotenv import load_dotenv
from requests import get, post
import firebase_admin
from firebase_admin import credentials, auth

load_dotenv()

# ---------- Firebase Admin ----------
# Only used to verify ID tokens on incoming API requests. Journal entries are
# written directly from the browser to Firestore via the client SDK (see
# firebase.js / book1.html), so this server does NOT touch Firestore at all.
# That's intentional: if the server also had its own write path (like the
# entries CRUD routes from an earlier version of this file), the two paths
# could easily end up storing the song data in different shapes -- which is
# exactly how a "one song per entry" rule quietly breaks.
cred = credentials.Certificate(os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"))
firebase_admin.initialize_app(cred)

# ---------- Spotify credentials ----------
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

app = Flask(__name__)
CORS(app)


# ---------- Auth decorator ----------
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed auth token"}), 401

        id_token = auth_header.split("Bearer ")[1]
        try:
            decoded = auth.verify_id_token(id_token)
            g.uid = decoded["uid"]
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "detail": str(e)}), 401

        return f(*args, **kwargs)
    return wrapper


# ---------- Spotify ----------
def get_token():
    auth_string = client_id + ":" + client_secret
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    result = post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result["access_token"]
    return token


def get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def search_song(token, song_name, artist_name=None):
    url = "https://api.spotify.com/v1/search"
    headers = get_auth_header(token)

    if artist_name:
        q_param = f"track:{song_name} artist:{artist_name}"
    else:
        q_param = song_name

    query = f"?q={quote(q_param)}&type=track&limit=1"
    query_url = url + query

    result = get(query_url, headers=headers)
    json_result = json.loads(result.content)["tracks"]["items"]

    if len(json_result) == 0:
        return None

    return json_result[0]


def get_song_info(token, song_name, artist_name=None):
    track = search_song(token, song_name, artist_name)
    if track is None:
        return None

    song_link = track["external_urls"]["spotify"]
    cover_url = track["album"]["images"][0]["url"]  # largest image
    song_title = track["name"]
    artist_names = ", ".join([artist["name"] for artist in track["artists"]])

    return {
        "title": song_title,
        "artist": artist_names,
        "link": song_link,
        "cover": cover_url
    }


spotify_token = get_token()


# ---------- Page routes ----------
@app.route("/")
@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/book")
def book_page():
    return render_template("book1.html")


# ---------- API: song search (the only API route this app needs now) ----------
@app.route("/api/search-song")
@login_required
def api_search_song():
    global spotify_token

    song_name = request.args.get("song_name", "")
    artist_name = request.args.get("artist_name")

    if not song_name:
        return jsonify({"error": "song_name parameter is required"}), 400

    info = get_song_info(spotify_token, song_name, artist_name)

    if info is None:
        # token may have expired (~hourly) -- refresh once and retry before giving up
        spotify_token = get_token()
        info = get_song_info(spotify_token, song_name, artist_name)

    if info is None:
        return jsonify({"error": "Song not found"}), 404

    return jsonify(info)


def main():
    app.run(debug=True, port=5000)


if __name__ == "__main__":
    main()