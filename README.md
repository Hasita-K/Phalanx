# HeartBeats - A Music-Powered journal website

HeartBeats is a web-based journal made to feel like a typical everyday notebook, with a to-do list and individual entries for each day. A song is assigned to each entry, pulling from the spotify API to hold the link and cover image of the song. 

## Main features 

- Firebase authentication 
- Calendar that directs you to your entry for a given day
- To-do list that check marks that can be indicated as completed
- Animated leather notebook
- Spotify API pulls to store link and image of a song searched by song name and artist name (Not properly implemented as of yet)

## Technologies used

- HTML5
- CSS
- JavaScript
- Spotify API
- Firebase Authentication + Firestore
- Google Fonts
- Flask
- Fetch API

## Structure
book.html is the main journal interface
firebase.js is the firebase configuration
login.html is the login page, routing to book.html
app.py runs the spotify API pull with the provided parameters(song name, artist name)


## Problems and future improvements
- Flask wasn't properly implemented, meaning the frontend could not successfully trigger an API call from app.py; In the future we plan to ensure the flask server is working and thus can make our song selection feature work.
- We plan to add additional features such as a mood tracker, journaling streak information, and song BPM
