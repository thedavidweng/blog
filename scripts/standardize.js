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

const files = walk('src/content/posts');

function isCaption(text) {
  text = text.trim();
  if (text.startsWith('#') || text.startsWith('- ') || text.startsWith('!')) return false;
  if (text.length > 70) return false;
  if (text.endsWith('。') || text.endsWith('.') || text.endsWith('？') || text.endsWith('！')) return false;
  return true;
}

function generateAltFromPath(imagePath) {
  const filename = imagePath.split('/').pop().split('.')[0];
  return filename.replace(/-/g, ' ');
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;
  
  // Replace ![](/path) followed by text
  const newContent = content.replace(/!\[\]\(([^)]+)\)\n([^\n]+)/g, (_match, imagePath, nextLine) => {
    if (isCaption(nextLine)) {
      return `![${nextLine.trim()}](${imagePath})\n`;
    } else {
      const altText = generateAltFromPath(imagePath);
      // Ensure there's a blank line separating the image and the paragraph
      return `![${altText}](${imagePath})\n\n${nextLine}`;
    }
  });

  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  // Find any remaining ![]() that weren't followed by text immediately, or were alone
  const newContent2 = content.replace(/!\[\]\(([^)]+)\)/g, (_match, imagePath) => {
    const altText = generateAltFromPath(imagePath);
    return `![${altText}](${imagePath})`;
  });

  if (newContent2 !== content) {
    content = newContent2;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});

console.log('Standardization complete.');
