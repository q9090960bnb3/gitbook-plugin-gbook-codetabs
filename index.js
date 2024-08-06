const replaceContent = require('./src/import')
const codetabs = require('./src/codetabs')


module.exports = {
    book: {
        assets: './assets',
        css: [
            'codetabs.css'
        ],
        js: [
            'codetabs.js'
        ]
    },
    hooks: {
      "page:before": async (page) => {
        // console.log('page before in')
        page.content = await replaceContent(page.rawPath, page.content);
        return page;
      },
    },
    blocks: {
        codetabs,
    }
};
