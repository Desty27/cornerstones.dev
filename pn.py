import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('pages/pricing.html','r',encoding='utf-8') as f:
    c = f.read()
nav_start = c.find('<nav>')
nav_end   = c.find('</nav>', nav_start) + len('</nav>')
open('pricing_nav.txt','w',encoding='utf-8').write(c[nav_start:nav_end])
print("written", nav_end - nav_start, "chars")
