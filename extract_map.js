const fs = require('fs');

const mapPaths = [
  '.next/dev/static/chunks/maple-map_src_0ibvv1y._.js.map',
  '.next/dev/server/chunks/ssr/maple-map_src_0dy8kxg._.js.map'
];

for (const mapPath of mapPaths) {
  try {
    const data = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    if (data.sections) {
      for (const section of data.sections) {
        if (section.map && section.map.sources) {
          const sources = section.map.sources;
          const contents = section.map.sourcesContent;
          for (let i = 0; i < sources.length; i++) {
            if (sources[i] && sources[i].includes('page.tsx')) {
              console.log(`Found page.tsx in ${mapPath}`);
              fs.writeFileSync('src/app/page.tsx', contents[i]);
              console.log('Saved to src/app/page.tsx');
              process.exit(0);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(`Error with ${mapPath}: ${e}`);
  }
}
console.log('Not found');
