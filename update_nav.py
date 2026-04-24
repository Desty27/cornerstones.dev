import re
import glob

files = glob.glob('*.html')

nav_template = '''<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md shadow-[0_4_25px_rgba(0,0,0,0.14)_inset] border-b border-white/10">
<div class="flex justify-between items-center px-8 py-4 max-w-[2200px] mx-auto">
<a href="/" class="flex items-center gap-2 text-2xl font-black italic tracking-tighter text-white">
<img class="h-8 w-auto" src="assets/logo-dark.svg" alt="CornerStones logo">
<span>CornerStones</span>
</a>
<div class="hidden md:flex gap-8 items-center">
<a class="font-uppercase-label text-uppercase-label {active_home} hover:text-[#faff69] transition-colors hover:bg-[#3a3a3a] transition-all duration-200 px-2 py-1" href="/">Home</a>
<a class="font-uppercase-label text-uppercase-label {active_services} hover:text-[#faff69] transition-colors hover:bg-[#3a3a3a] transition-all duration-200 px-2 py-1" href="services.html">Services</a>
<a class="font-uppercase-label text-uppercase-label {active_squad} hover:text-[#faff69] transition-colors hover:bg-[#3a3a3a] transition-all duration-200 px-2 py-1" href="squad.html">Squads</a>
<a class="font-uppercase-label text-uppercase-label {active_cases} hover:text-[#faff69] transition-colors hover:bg-[#3a3a3a] transition-all duration-200 px-2 py-1" href="cases.html">Case Studies</a>
<a class="font-uppercase-label text-uppercase-label {active_pricing} hover:text-[#faff69] transition-colors hover:bg-[#3a3a3a] transition-all duration-200 px-2 py-1" href="pricing.html">Pricing</a>
</div>
<button class="bg-[#faff69] text-[#141414] font-uppercase-label text-uppercase-label px-4 py-2 rounded-DEFAULT hover:bg-white transition-all active:scale-95 hidden md:block">Deploy Now</button>
<!-- Mobile Menu Toggle -->
<button class="md:hidden text-white hover:text-[#faff69]">
<span class="material-symbols-outlined text-3xl">menu</span>
</button>
</div>
</nav>'''

active_style = 'text-[#faff69] border-b-2 border-[#faff69] pb-1'
inactive_style = 'text-white'

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    active_home = active_style if filepath == 'index.html' else inactive_style
    active_services = active_style if filepath == 'services.html' else inactive_style
    active_squad = active_style if filepath == 'squad.html' else inactive_style
    active_cases = active_style if 'case' in filepath else inactive_style
    active_pricing = active_style if filepath == 'pricing.html' else inactive_style

    nav_rendered = nav_template.format(
        active_home=active_home,
        active_services=active_services,
        active_squad=active_squad,
        active_cases=active_cases,
        active_pricing=active_pricing
    )

    content = re.sub(r'(<!-- TopNavBar -->\s*)?(<nav[^>]*>.*?</nav>|<header[^>]*>.*?</header>)', nav_rendered, content, count=1, flags=re.DOTALL)
    
    # Restore links in the body/content (like the Case Studies sub-nav)
    content = re.sub(r'href="/case_velocity"', 'href="case_velocity.html"', content)
    content = re.sub(r'href="/case_apex"', 'href="case_apex.html"', content)
    content = re.sub(r'href="/case_catalyst"', 'href="case_catalyst.html"', content)
    content = re.sub(r'href="/case_rag"', 'href="case_rag.html"', content)
    content = re.sub(r'href="/cases"', 'href="cases.html"', content)
    
    # And fix the logo back to relative, so it works locally even if not served from root
    content = re.sub(r'src="/assets/logo-dark\.svg"', 'src="assets/logo-dark.svg"', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Headers updated to .html links.")
