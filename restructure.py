import os
import re

# Files to move into directories
pages = [
    "services",
    "squad",
    "pricing",
    "cases",
    "case_rag",
    "case_catalyst",
    "case_apex",
    "case_velocity"
]

def update_links(content, depth=0):
    # depth=0 means we are at the root (index.html)
    # depth=1 means we are inside a subfolder (e.g. services/index.html)
    
    prefix = "../" if depth == 1 else "./"
    
    # Replace absolute looking hrefs from our previous script or simple links
    # Home link
    content = re.sub(r'href="(/|index\.html)"', f'href="{prefix}"', content)
    
    # Page links
    for p in pages:
        # Match href="/p", href="/p/", href="p.html", href="./p/"
        # We will aggressively target them.
        content = re.sub(r'href="(/|./)?' + p + r'(/|\.html)?"', f'href="{prefix}{p}/"', content)
        
    # Fix assets
    # Match src="assets/..." or src="/assets/..."
    content = re.sub(r'src="(/|./)?assets/', f'src="{prefix}assets/', content)
    
    return content

# 1. Update index.html
if os.path.exists("index.html"):
    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()
    content = update_links(content, depth=0)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(content)

# 2. Process all sub-pages
for p in pages:
    old_file = f"{p}.html"
    if os.path.exists(old_file):
        with open(old_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        content = update_links(content, depth=1)
        
        # Create directory
        os.makedirs(p, exist_ok=True)
        
        # Write to index.html inside directory
        with open(os.path.join(p, "index.html"), "w", encoding="utf-8") as f:
            f.write(content)
        
        # Remove old file
        os.remove(old_file)

print("Restructuring complete! All pages are now using directory-based routing (e.g., services/index.html) with robust relative paths.")
