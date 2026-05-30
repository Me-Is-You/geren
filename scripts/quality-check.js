const fs = require('fs');
const path = require('path');

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src/index.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/sass/sections/_dynamic-site.scss'), 'utf8');
const required = [
  ['theme switcher', 'data-theme-option="dark"'],
  ['article section', 'id="articles"'],
  ['article search', 'id="articleSearch"'],
  ['projects section', 'id="projects"'],
  ['architecture section', 'id="architecture"'],
  ['message form', 'id="messageForm"'],
  ['admin prototype', 'id="admin"'],
  ['protected resume menu', 'data-protected-resume'],
  ['auth dialog', 'id="authDialog"'],
  ['resume dialog', 'id="resumeDialog"'],
];

let failed = false;
for (const [label, token] of required) {
  if (!html.includes(token)) {
    console.error(`✗ Missing ${label}: ${token}`);
    failed = true;
  } else {
    console.log(`✓ ${label}`);
  }
}

const jsChecks = [
  ['theme storage', 'localStorage.setItem(THEME_KEY'],
  ['smart theme', 'getSmartTheme'],
  ['article filter/search', 'refreshArticles'],
  ['guestbook storage', 'saveMessages'],
  ['admin preview', 'initAdminPreview'],
  ['protected resume auth', 'initProtectedResume'],
  ['XSS escaping', 'escapeHtml'],
];
for (const [label, token] of jsChecks) {
  if (!js.includes(token)) {
    console.error(`✗ Missing JS ${label}`);
    failed = true;
  } else {
    console.log(`✓ JS ${label}`);
  }
}

const cssChecks = [
  ['dark variables', ':root'],
  ['blue theme', 'html[data-theme="blue"]'],
  ['green theme', 'html[data-theme="green"]'],
  ['responsive rules', '@media (max-width: 56.25em)'],
  ['admin styles', '.admin-layout'],
  ['protected resume styles', '.protected-dialog'],
];
for (const [label, token] of cssChecks) {
  if (!css.includes(token)) {
    console.error(`✗ Missing CSS ${label}`);
    failed = true;
  } else {
    console.log(`✓ CSS ${label}`);
  }
}

if (failed) process.exit(1);
console.log('\nSiiiweb quality check passed.');
