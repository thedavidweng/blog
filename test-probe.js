import probe from 'probe-image-size';
import fs from 'fs';
const data = fs.readFileSync('public/posts/canada-international-student-banking-guide-2023/canada-amex-cobalt-card.avif');
console.log(probe.sync(data));
