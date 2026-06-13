import sys
sys.stdout.reconfigure(encoding='utf-8')

# Check index.html - find nav structure
with open('index.html','r',encoding='utf-8') as f:
    idx = f.read()

# Find nav tag
nav_start = idx.find('<nav ')
nav_end = idx.find('</nav>', nav_start) + len('</nav>')
open('nav_index.txt','w',encoding='utf-8').write(idx[nav_start-200:nav_start+50])
print("index nav context written")

# Check pricing.html
with open('pages/pricing.html','r',encoding='utf-8') as f:
    pr = f.read()
nav_start2 = pr.find('<nav>')
nav_end2 = pr.find('</nav>', nav_start2) + len('</nav>')
open('nav_pricing.txt','w',encoding='utf-8').write(pr[nav_start2-200:nav_start2+50])
print("pricing nav context written")
