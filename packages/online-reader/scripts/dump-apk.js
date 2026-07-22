// Quick dump of APK contents to understand what data is available
const AdmZip = require('adm-zip');
const path = require('path');

const apkDir = path.join(process.env.APPDATA, 'Houdoku', 'Keiyoushi APK Extensions');
const files = ['tachiyomi-all.mangafire-v1.4.26.apk', 'tachiyomi-en.comix-v1.4.33.apk'];

for (const file of files) {
  const filePath = path.join(apkDir, file);
  console.log(`\n======= ${file} =======`);
  
  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    console.log(`Total entries: ${entries.length}`);
    
    // Show assets directory
    const assets = entries.filter(e => e.entryName.startsWith('assets/'));
    console.log(`\nAssets (${assets.length}):`);
    assets.forEach(e => console.log(`  ${e.entryName} (${e.getData().length} bytes)`));
    
    // Show res/raw or res/values if they exist
    const resFiles = entries.filter(e => e.entryName.match(/^res\//));
    console.log(`\nResources (${resFiles.length}):`);
    resFiles.slice(0, 20).forEach(e => console.log(`  ${e.entryName} (${e.getData().length} bytes)`));
    
    // Show any JSON or config files
    const configFiles = entries.filter(e => e.entryName.match(/\.(json|xml|properties|conf)$/i));
    console.log(`\nConfig files (${configFiles.length}):`);
    configFiles.slice(0, 20).forEach(e => {
      const buf = e.getData();
      let preview = '';
      try {
        preview = buf.toString('utf-8').substring(0, 200);
      } catch {}
      console.log(`  ${e.entryName} (${buf.length} bytes): ${preview}`);
    });

    // Show classes.dex info
    const dexEntry = entries.find(e => e.entryName === 'classes.dex');
    if (dexEntry) {
      console.log(`\nclasses.dex: ${dexEntry.getData().length} bytes`);
      // Look for base URL pattern in the DEX (strings are often visible)
      const buf = dexEntry.getData();
      const text = buf.toString('utf-8');
      // Find https?:// URLs
      const urls = text.match(/https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\x00-\x1f"'\s\\]*/g);
      if (urls) {
        const unique = [...new Set(urls)].filter(u => !u.includes('android.com') && !u.includes('schemas.android') && !u.includes('w3.org') && !u.includes('xmlns'));
        console.log(`\nPotential URLs found in DEX (${unique.length}):`);
        unique.slice(0, 15).forEach(u => console.log(`  ${u}`));
      }
    }
    
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

console.log('\n======= DONE =======');
