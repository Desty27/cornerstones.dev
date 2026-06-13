import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# ─── 1. Fix wrong services.html paths in ALL pages ────────────────────────────
files_to_fix_paths = ['index.html', 'pages/pricing.html', 'pages/leads.html',
                      'pages/reviews.html', 'pages/websites.html', 'pages/work.html']

for path in files_to_fix_paths:
    with open(path,'r',encoding='utf-8') as f:
        c = f.read()
    is_subpage = path.startswith('pages/')
    if is_subpage:
        # inside pages/ folder: pages/services.html → services.html
        c = c.replace('href="pages/services.html"', 'href="services.html"')
    # index.html already correct (pages/services.html is right from root)
    with open(path,'w',encoding='utf-8') as f:
        f.write(c)
    print(f'Path fixed: {path}')

# ─── 2. Fix services.html — move <nav> outside <header> ──────────────────────
with open('pages/services.html','r',encoding='utf-8') as f:
    c = f.read()

# The nav + brand links block is inside <header><div class="wrap"><nav>...</nav></div></header>
# We need to lift <nav>...</nav> out of <header> and place it before <header>

header_start = c.find('\n  <header>')
header_end   = c.find('</header>') + len('</header>')
header_block = c[header_start:header_end]

# Extract just the <nav>...</nav> block from inside header
nav_start = header_block.find('\n      <nav>')
nav_end   = header_block.find('</nav>') + len('</nav>')
nav_block = header_block[nav_start:nav_end]

# Build replacement: nav before header, header removed entirely
new_nav = f'\n  <nav>{nav_block[len(chr(10)+"      <nav>"):-(len("</nav>")-len("</nav>"))]}</nav>'

# Simpler: just rebuild completely
# Extract nav content between <nav> and </nav>
inner_nav_match = re.search(r'<header>.*?<nav>(.*?)</nav>.*?</header>', c, re.DOTALL)
if inner_nav_match:
    inner_nav = inner_nav_match.group(1)
    # Replace entire header with just the nav (outside header)
    c = re.sub(
        r'\n  <header>.*?</header>',
        f'\n  <nav>\n{inner_nav}\n  </nav>',
        c,
        flags=re.DOTALL
    )
    print('services.html nav moved outside header')
else:
    print('ERROR: could not find nav inside header')

with open('pages/services.html','w',encoding='utf-8') as f:
    f.write(c)

# ─── 3. Fix work.html — ensure nav is outside header and sticky ───────────────
with open('pages/work.html','r',encoding='utf-8') as f:
    c = f.read()

# Check if nav is already outside header
nav_pos = c.find('<nav>')
if nav_pos == -1:
    nav_pos = c.find('<nav ')
header_pos = c.find('<header>')

if header_pos != -1 and nav_pos > header_pos:
    print('work.html: nav is inside header - needs fixing')
    inner_nav_match = re.search(r'<header>.*?<nav>(.*?)</nav>.*?</header>', c, re.DOTALL)
    if inner_nav_match:
        inner_nav = inner_nav_match.group(1)
        c = re.sub(
            r'<header>.*?</header>',
            f'<nav>\n{inner_nav}\n  </nav>',
            c,
            count=1,
            flags=re.DOTALL
        )
        print('work.html nav moved outside header')
else:
    print(f'work.html: nav already at pos {nav_pos}, header at pos {header_pos} - OK or no header')

with open('pages/work.html','w',encoding='utf-8') as f:
    f.write(c)

print('\nAll done!')
