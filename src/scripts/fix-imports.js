import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function* getFiles(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      yield* getFiles(path);
    } else if (file.isFile() && path.endsWith('.js')) {
      yield path;
    }
  }
}

function getRelativePath(fromPath, toPath) {
  const from = dirname(fromPath);
  let relativePath = relative(from, toPath).replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return relativePath;
}

async function fixImports() {
  try {
    for await (const filePath of getFiles('./dist')) {
      let content = await readFile(filePath, 'utf-8');
      
      // Fix relative imports
      content = content.replace(
        /from ['"](\.[^'"]+)['"]/g,
        (match, importPath) => {
          if (importPath.endsWith('.js')) return match;
          return `from '${importPath}.js'`;
        }
      );

      // Fix @ imports (convert to relative paths with .js)
      content = content.replace(
        /from ['"]@\/([^'"]+)['"]/g,
        (match, importPath) => {
          const targetPath = join('dist/src', importPath + '.js');
          const relativePath = getRelativePath(filePath, targetPath);
          return `from '${relativePath}'`;
        }
      );

      await writeFile(filePath, content, 'utf-8');
      console.log(`Fixed imports in: ${filePath}`);
    }

    console.log('All imports have been fixed!');
  } catch (error) {
    console.error('Error fixing imports:', error);
  }
}

fixImports();