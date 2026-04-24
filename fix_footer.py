import os
import glob
import re

files = glob.glob("*/index.html")

# The exact footer logo structure from index.html (with appropriate relative path prefix)
def update_footer(content, prefix):
    # Match the varied footer logo structures like text-lg, text-xl, etc.
    pattern = r'<div class="flex items-center gap-2 text-\w+ font-black text-white[^>]*>.*?<span>CornerStones</span>.*?</div>'
    
    # Replacement matching index.html text-xl
    replacement = f'''<div class="flex items-center gap-2 text-xl font-black text-white mb-4">
<img class="h-8 w-auto" src="{prefix}assets/logo-dark.svg" alt="CornerStones logo">
<span>CornerStones</span>
</div>'''
    
    # We use DOTALL so .*? matches newlines inside the div
    return re.sub(pattern, replacement, content, flags=re.DOTALL)

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The files are all inside 1-level deep directories (services/, squad/, etc.)
    content = update_footer(content, "../")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footer logos standardized to match index.html!")
