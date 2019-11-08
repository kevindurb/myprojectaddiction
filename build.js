const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');

const postFilePath = x => path.join(__dirname, './posts', x);
const distFilePath = x => path.join(__dirname, './dist', x);
const rootFilePath = x => path.join(__dirname, x);
const readFile = x => fs.readFile(x, { encoding: 'utf-8' });

async function build() {
  const postTemplateContent = await readFile(rootFilePath('./post.ejs'));
  const postTemplate = ejs.compile(postTemplateContent);
  const files = await fs.readdir(postFilePath(''));

  await Promise.all(files.map(async (file) => {
    console.log(file);

    const content = await readFile(postFilePath(file));

    const html = postTemplate({ content: marked(content) });

    const name = path.basename(file, '.md');
    return fs.writeFile(distFilePath(`${name}.html`), html);
  }));
}

async function clean() {
  const distFiles = await fs.readdir(distFilePath(''));

  await Promise.all(distFiles.map(file => file !== '.gitkeep' ? fs.unlink(distFilePath(file)) : null));
}


clean()
  .then(build);
