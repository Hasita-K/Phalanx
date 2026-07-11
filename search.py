from dotenv import load_dotenv
import os
import base64
from requests import get, post
import json
load_dotenv()

# pull personal spotify API credentials from .env 
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

# recieve access token from Spotify API 
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


def search_song(token, song_name, artist_name):
    url = "https://api.spotify.com/v1/search"
    headers = get_auth_header(token)
    
    if artist_name:
        q_param = f"track:{song_name} artist:{artist_name}"
    else:
        q_param = song_name

    query = f"?q={q_param}&type=track&limit=1"
    query_url = url + query
    # get search results as JSON
    result = get(query_url, headers=headers)
    json_result = json.loads(result.content)["tracks"]["items"]

    if len(json_result) == 0:
        print("Song not found.")
        return None

    return json_result[0]


# 
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


token = get_token()

# pull song name and artist name from front end later on
song_name = "Hot Water"
artist_name = "Earl"
info = get_song_info(token, song_name, artist_name)  

if info:
    print(f"\nTitle: {info['title']}")
    print(f"Artist: {info['artist']}")
    print(f"Link: {info['link']}")
    print(f"Cover Art: {info['cover']}")
    song_link = info['link']
    cover_image = get(info['cover']).content

