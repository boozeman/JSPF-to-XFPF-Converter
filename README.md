# JSPF-to-XSPF-Converter
Simple Listenbrainz.org jspf playlist converter for Tidal XSPF Playlists made with AI assist

# Features

* Converts JSPF to XFPF

# Setup

Clone repository
```
git clone https://github.com/boozeman/JSPF-to-XSPF-Converter.git
```

Adjust playlist-converter/dockerfile and docker-compose suitable for your needs

```
docker compose build playlist-converter
docker compose up playlist-converter -d
```

# Usage

- Go to your listenbrains.org Created for you page
- Select Weekly Jams or Weekly Exploration
- Use that cog to export playlist as jspf
- Use this converter to convert jspf to xspf (file generated at user Downloads dir on Windows and named playlist.xspf)
- Go to your Tidal playlists and press that ... -> Transfer your music
- Approve and Connect
- Upload file
- Select playlist.xspf
- Press Transfer to Tidal
- Press Complete
- PROFIT!


# DISCLAIMER 

Rear Lights Warranty is on!
