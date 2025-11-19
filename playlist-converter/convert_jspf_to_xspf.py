#!/usr/bin/env python3
"""
convert_jspf_to_xspf.py

Usage:
    python3 convert_jspf_to_xspf.py input.jspf output.xspf
    python3 convert_jspf_to_xspf.py - output.xspf   # read JSPF JSON from stdin
"""
import argparse
import json
import sys
import xml.etree.ElementTree as ET

XSPF_NS = "http://xspf.org/ns/0/"

def safe_text(parent, tag, text):
    if text is None:
        return
    el = ET.SubElement(parent, tag)
    el.text = str(text)

def jspf_to_xspf(jspf):
    # Accept either top-level playlist object, or raw list/object variations.
    if isinstance(jspf, dict) and 'playlist' in jspf:
        pl = jspf['playlist']
    else:
        pl = jspf

    ET.register_namespace('', XSPF_NS)
    playlist = ET.Element(f"{{{XSPF_NS}}}playlist", version="1")
    # metadata like title, creator, annotation
    if isinstance(pl, dict):
        for key in ('title', 'creator', 'annotation', 'info', 'location'):
            if key in pl and pl[key] is not None:
                safe_text(playlist, key, pl[key])

    tracklist = ET.SubElement(playlist, f"{{{XSPF_NS}}}trackList")

    tracks = []
    # JSPF often uses 'track' array or 'tracks'
    if isinstance(pl, dict):
        if 'track' in pl and isinstance(pl['track'], list):
            tracks = pl['track']
        elif 'tracks' in pl and isinstance(pl['tracks'], list):
            tracks = pl['tracks']
    elif isinstance(pl, list):
        tracks = pl

    for t in tracks:
        # Each track expected to be dict with keys like title, creator, album, location, duration
        if not isinstance(t, dict):
            continue
        track_el = ET.SubElement(tracklist, f"{{{XSPF_NS}}}track")
        safe_text(track_el, f"{{{XSPF_NS}}}title", t.get('title') or t.get('name'))
        safe_text(track_el, f"{{{XSPF_NS}}}creator", t.get('creator') or t.get('artist'))
        safe_text(track_el, f"{{{XSPF_NS}}}album", t.get('album') or t.get('albumTitle'))
        # location often is 'location' or 'uri'
        loc = t.get('location') or t.get('uri') or t.get('file') or t.get('url')
        safe_text(track_el, f"{{{XSPF_NS}}}location", loc)
        # duration: ensure an integer (milliseconds) if present
        dur = t.get('duration')
        if dur is not None:
            try:
                dur_i = int(dur)
                safe_text(track_el, f"{{{XSPF_NS}}}duration", dur_i)
            except Exception:
                # ignore non-int durations
                pass
        # optional annotation/info
        safe_text(track_el, f"{{{XSPF_NS}}}annotation", t.get('annotation') or t.get('info'))

    return playlist

def main():
    parser = argparse.ArgumentParser(description="Convert JSPF (JSON) to XSPF (XML).")
    parser.add_argument('input', help="Input JSPF file path or '-' to read from stdin")
    parser.add_argument('output', help="Output XSPF file path")
    args = parser.parse_args()

    # Read input JSON
    raw = None
    if args.input == '-':
        raw = sys.stdin.read()
    else:
        with open(args.input, 'r', encoding='utf-8') as f:
            raw = f.read()

    try:
        jspf = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Error: input is not valid JSON: {e}", file=sys.stderr)
        sys.exit(2)

    playlist_el = jspf_to_xspf(jspf)

    # Build tree and write with xml declaration and UTF-8 encoding
    tree = ET.ElementTree(playlist_el)
    # Ensure namespace prefix-less output by registering default namespace above
    tree.write(args.output, encoding='utf-8', xml_declaration=True, method='xml')
    print(f"Wrote XSPF to {args.output}", file=sys.stderr)

if __name__ == '__main__':
    main()
