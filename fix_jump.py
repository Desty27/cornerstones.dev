import os
import glob
import re

files = ["index.html"] + glob.glob("*/index.html")

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add overflow-y-scroll to body to prevent scrollbar jumping
    if "overflow-y-scroll" not in content:
        content = re.sub(r'<body class="([^"]*)"', r'<body class="\1 overflow-y-scroll"', content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Added overflow-y-scroll to all pages to lock the navigation bar.")
