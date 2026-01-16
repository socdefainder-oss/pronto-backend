const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\page.tsx';

console.log('Reading file...');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Restaurant type to include logoUrl
console.log('1. Updating Restaurant type...');
content = content.replace(
  /type Restaurant = \{ id: string; name: string; slug: string; phone: string \}/,
  'type Restaurant = { id: string; name: string; slug: string; phone: string; logoUrl?: string | null }'
);

// 2. Replace restaurant icon with conditional logo
console.log('2. Replacing restaurant icon with conditional logo...');
const iconSearch = `                        {/* Restaurant icon */}
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>`;

const iconReplacement = `                        {/* Restaurant icon/logo */}
                        {r.logoUrl ? (
                          <img 
                            src={r.logoUrl} 
                            alt={r.name}
                            className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-emerald-200 mb-4"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}`;

content = content.replace(iconSearch, iconReplacement);

// Write the updated content
console.log('Writing updated file...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Dashboard updated successfully!');
console.log('Changes made:');
console.log('  1. Added logoUrl?: string | null to Restaurant type');
console.log('  2. Added conditional logo rendering in restaurant cards');
