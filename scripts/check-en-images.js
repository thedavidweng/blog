import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.md')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/content/posts/en');
let matches = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const regex = /!\[\]\(([^)]+)\)\n([^\n]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!match[2].startsWith('#') && !match[2].startsWith('!') && !match[2].startsWith('-')) {
      matches.push({ text: match[2] });
    }
  }
});
console.log(JSON.stringify(matches, null, 2));
