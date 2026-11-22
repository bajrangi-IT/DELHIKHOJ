import re

p = 'src/lib/delhi-data.ts'
lines = open(p, encoding='utf-8').read().split('\n')

deva = {
    'bara-gumbad': 'ब\u0921\u093c\u093e \u0917\u0941\u0902\u092c\u0926',
    'raj-ghat': '\u0930\u093e\u091c \u0918\u093e\u091f',
    'national-war-memorial': '\u0930\u093e\u0937\u094d\u091f\u094d\u0930 \u092a\u094d\u0930\u0936\u093e\u0938\u0940 \u092f\u0941\u0926\u094d\u0927 \u092e\u0947\u092e\u094b\u0930\u093f\u092f\u0932',
    'national-railway-museum': '\u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u0930\u0947\u0932 \u0938\u0902\u0917\u094d\u0930\u0939\u093e\u0932\u092f',
    'ngma': '\u0928\u0947\u0936\u0928\u0932 \u0917\u0948\u0932\u0930\u0940 \u0911\u092b \u092e\u0949\u0921\u0930\u094d\u0928 \u0906\u0930\u094d\u091f',
    'indira-gandhi-memorial': '\u0907\u0902\u0926\u093f\u0930\u093e \u0917\u093e\u0902\u0927\u0940 \u0938\u094d\u092e\u0943\u0924\u093f',
    'teen-murti-house': '\u0924\u0940\u0928 \u092e\u0942\u0930\u094d\u0924\u093f \u092d\u0935\u0928',
    'hauz-khas-village': '\u0939\u094c\u091c \u0916\u093e\u0938 \u0917\u093e\u0902\u0935',
}

# Rebuild the first line of each broken destination object: from 'slug: "X"' up to 'category:'
out = []
for ln in lines:
    m = re.match(r'\s*slug: "([a-z0-9-]+)", name: "([^"]*)", nameHi: .*?, category: "([^"]*)", era: "([^"]*)", locality: "([^"]*)",', ln)
    if m and m.group(1) in deva:
        slug = m.group(1)
        out.append(f'    slug: "{slug}", name: "{m.group(2)}", nameHi: "{deva[slug]}", category: "{m.group(3)}", era: "{m.group(4)}", locality: "{m.group(5)}",')
    else:
        out.append(ln)

s = '\n'.join(out)
s = re.sub(r'description: "A red sandstone Anglican cathedral[^"]*"', 'description: "A red sandstone Anglican cathedral designed by W. R. Mustoe and completed in 1881."', s)
s = re.sub(r'nameHi: "[^"]*FIX[^"]*"', 'nameHi: null', s)
s = s.replace('→ omit (null).', '')
# guard: any remaining nameHi with stray quotes would break; ensure garden/buddha lines are clean
s = s.replace('nameHi: null as unknown as string, category: "garden", era: "Modern", locality: "Mehrauli",', 'nameHi: "प Deposit? "'.replace('प Deposit? ', '\u092a\u0902\u091a \u0938\u0947\u0928\u094d\u0938 \u0915\u093e \u0917\u093e\u0930\u094d\u0921\u0928') + ', category: "garden", era: "Modern", locality: "Mehrauli",')
s = s.replace('nameHi: null as unknown as string, category: "garden", era: "Modern", locality: "Ridge",', 'nameHi: "' + '\u092c\u0941\u0926\u094d\u0927 \u091c\u092f\u0928\u094d\u0924\u093f \u092a\u093e\u0930\u094d\u0915' + '", category: "garden", era: "Modern", locality: "Ridge",')

open(p, 'w', encoding='utf-8').write(s)
print('done')
