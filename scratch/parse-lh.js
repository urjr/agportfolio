const fs = require('fs');
const path = require('path');

const files = ['lighthouse-home.json', 'lighthouse-about.json', 'lighthouse-work.json'];
const scratchDir = '/Users/ulisesreyes/websites/agportfolio/scratch';

files.forEach(file => {
  const filePath = path.join(scratchDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  const report = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const score = report.categories.accessibility.score;
  console.log(`\n========================================`);
  console.log(`REPORT FOR: ${report.requestedUrl}`);
  console.log(`ACCESSIBILITY SCORE: ${score * 100} / 100`);
  console.log(`========================================`);

  const failedAudits = Object.values(report.audits)
    .filter(audit => audit.score !== null && audit.score < 1);
  
  if (failedAudits.length === 0) {
    console.log("No failed accessibility audits!");
  } else {
    failedAudits.forEach(audit => {
      console.log(`\n- [${audit.id}] ${audit.title} (Score: ${audit.score})`);
      console.log(`  Description: ${audit.description}`);
      if (audit.details && audit.details.items && audit.details.items.length > 0) {
        console.log(`  Failing elements:`);
        audit.details.items.forEach(item => {
          if (item.node) {
            console.log(`    Selector: "${item.node.selector}"`);
            console.log(`    Snippet:  \`${item.node.snippet}\``);
            if (item.node.explanation) {
              console.log(`    Explanation: ${item.node.explanation}`);
            }
          } else {
            console.log(`    Details: ${JSON.stringify(item)}`);
          }
        });
      }
    });
  }
});
