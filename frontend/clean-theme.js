const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove purple gradients
    content = content.replace(/bg-gradient-to-[a-z]+ from-indigo-\d+ to-purple-\d+/g, '');
    content = content.replace(/bg-gradient-to-[a-z]+ from-indigo-\d+ via-white to-purple-\d+/g, 'bg-background');
    content = content.replace(/bg-gradient-to-[a-z]+ from-indigo-\d+ to-purple-\d+ bg-clip-text text-transparent/g, 'text-primary');
    content = content.replace(/hover:from-indigo-\d+ hover:to-purple-\d+/g, '');
    content = content.replace(/shadow-indigo-\d+/g, '');
    
    // Some specific sidebar hover states
    content = content.replace(/bg-gradient-to-[a-z]+ from-indigo-50 to-purple-50 text-indigo-700 shadow-sm dark:from-indigo-950\/50 dark:to-purple-950\/50 dark:text-indigo-300/g, 'bg-primary/10 text-primary');
    content = content.replace(/bg-gradient-to-[a-z]+ from-indigo-50 to-purple-50 text-indigo-700/g, 'bg-primary/10 text-primary');

    // Replace common zinc with semantic tokens
    content = content.replace(/text-zinc-900/g, 'text-foreground');
    content = content.replace(/text-zinc-500/g, 'text-muted-foreground');
    content = content.replace(/text-zinc-400/g, 'text-muted-foreground');
    content = content.replace(/border-zinc-\d+(\/\d+)?/g, 'border-border');
    content = content.replace(/bg-zinc-50 dark:bg-zinc-950/g, 'bg-background');
    content = content.replace(/bg-zinc-50/g, 'bg-background');
    content = content.replace(/bg-white/g, 'bg-card');
    
    // Fix Card headers that got bg-card by accident (well, bg-white was replaced by bg-card)
    // Actually replacing all bg-white with bg-card is fine for dark mode since cards should use card token
    
    content = content.replace(/text-indigo-600/g, 'text-primary');
    content = content.replace(/text-indigo-700/g, 'text-primary');
    content = content.replace(/bg-indigo-50/g, 'bg-primary/10');
    content = content.replace(/bg-indigo-100/g, 'bg-primary/20');
    content = content.replace(/border-indigo-200/g, 'border-primary/20');
    content = content.replace(/border-t-indigo-600/g, 'border-t-primary');
    
    // Clean up multiple spaces in classes
    content = content.replace(/className="([^"]+)"/g, (match, p1) => {
      return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
