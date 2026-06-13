import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# Restore services.html from git and redo properly
import subprocess
subprocess.run(['git', 'checkout', 'HEAD', '--', 'pages/services.html'], check=True)

with open('pages/services.html','r',encoding='utf-8') as f:
    c = f.read()

# Find the header block
header_start = c.find('<header>')
header_end   = c.find('</header>') + len('</header>')

header_block = c[header_start:header_end]
print("Header block length:", len(header_block))

# Extract the nav block from inside the wrap div
# Structure: <header><div class="wrap"><nav>...</nav></div></header>
wrap_start = header_block.find('<div class="wrap">')
nav_open   = header_block.find('<nav>', wrap_start)
nav_close  = header_block.find('</nav>', nav_open) + len('</nav>')

nav_inner = header_block[nav_open + len('<nav>'):nav_close - len('</nav>')]
print("Nav inner length:", len(nav_inner))

# Build the new standalone nav (direct child of body, same as pricing.html)
new_nav = f'<nav>\n    <div class="wrap">\n{nav_inner}\n    </div>\n  </nav>'

# Replace the old <header>...</header> block with just the nav
c = c[:header_start] + new_nav + c[header_end:]

with open('pages/services.html','w',encoding='utf-8') as f:
    f.write(c)

print("services.html fixed!")
