const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');
const frontMatter = require('front-matter');

const postFilePath = x => path.join(__dirname, './posts', x);
const distFilePath = x => path.join(__dirname, './dist', x);
const rootFilePath = x => path.join(__dirname, x);
const readFile = x => fs.readFile(x, { encoding: 'utf-8' });
const writeFile = (x, y) => fs.writeFile(x, y);

async function buildPosts() {
  const postTemplateContent = await readFile(rootFilePath('./post.ejs'));
  const postTemplate = ejs.compile(postTemplateContent);
  const files = await fs.readdir(postFilePath(''));

  return Promise.all(files.map(async (file) => {
    console.log(file);

    const content = await readFile(postFilePath(file));

    const {
      attributes,
      body,
    } = frontMatter(content);
    const html = postTemplate({ ...attributes, content: marked(body) });
    const fileName = path.basename(file, '.md');
    const outFile = `${fileName}.html`;

    await writeFile(distFilePath(outFile), html);

    return {
      ...attributes,
      file,
      url: `/${outFile}`,
    };
  }));
}

async function buildIndex(posts) {
  const templateContent = await readFile(rootFilePath('./index.ejs'));
  const template = ejs.compile(templateContent);

  return writeFile(
    distFilePath('index.html'),
    template({ posts }),
  );
}

async function clean() {
  const distFiles = await fs.readdir(distFilePath(''));

  await Promise.all(distFiles.map(file => file !== '.gitkeep' ? fs.unlink(distFilePath(file)) : null));
}


clean()
  .then(buildPosts)
  .then(buildIndex);
