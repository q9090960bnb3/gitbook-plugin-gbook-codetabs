const escape = require('escape-html');
const {HtmlAttr2Obj} = require("../parse")
/*
    Generate HTML for the tab in the header
    @param {string} title
    @param {number} i
    @param {Boolean} isActive
    @return {String}
*/
function createTab(title, i, isActive) {
    return '<div class="tab' + (isActive? ' active' : '') + '" data-codetab="' + i + '">' + title + '</div>';
}

/*
    Generate HTML for the tab's content

    @param {string} title
    @param {string} code
    @param {number} i
    @param {Boolean} isActive
    @return {String}
*/
function createTabBody(lang, code, i, isActive) {
    return '<div class="tab' + (isActive? ' active' : '') + '" data-codetab="' + i + '"><pre><code class="lang-' + (lang) + '">'
        + escape(code) +
    '</code></pre></div>';
}

function codeBlocks(str) {
    if (typeof str !== 'string') {
        throw new TypeError('expected a string');
      }
    
      var regex =   /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
      var blocks = [];
      var match = null;
    
      while ((match = regex.exec(str))) {
        blocks.push({
          start: match.index,
          end: match.index + match[1].length,
          lang: match[3],
          code: match[4],
          block: match[1]
        });
      }
      return blocks;
}

const reg = /([a-zA-Z]+)[ \t]*(?:({.+}))?/

const codetabs = {
    blocks: ['language'],
    process: function(block) {
        // console.warn('block:', block)
        let body = block.body
        body = body.replace(/\{% raw %\}/g, "")
        body = body.replace(/\{% endraw %\}/g, "")
       
        const mBlock = new Map()

            let index =  Date.now() * 1000;
            codeBlocks(body).map(({
                lang,
                code
            }) => {
                const res = lang.match(reg)
                lang = res[1].trim()
                const info = HtmlAttr2Obj(res[2])
                // console.log('lang:', lang)
                // console.log('code:', code)
                // console.log('info:', info)

                let key = info.group || index++
                let title = info.title || lang
                
                if (mBlock.has(key)) {
                    const item = mBlock.get(key)
                    code = item.code + code
                    lang = item.lang
                    title = item.title
                }

                mBlock.set(key, {
                    lang,
                    title,
                    code
                })
            })

            let tabsHeader = '';
            let tabsContent = '';
            let i = 0
            mBlock.forEach(({lang, code, title}) => {
                tabsHeader += createTab(title, i, i == 0);
                tabsContent += createTabBody(lang, code, i, i==0);
                i++
            })

        // blocks.forEach(function(block, i) {
        //     console.warn('block:', block)
        //     var isActive = (i == 0);

        //     if (!block.kwargs.name) {
        //         throw new Error('Code tab requires a "name" property');
        //     }

        //     tabsHeader += createTab(block, i, isActive);
        //     tabsContent += createTabBody(block, i, isActive);
        // });

        return '<div class="codetabs">' +
            '<div class="codetabs-header">' + tabsHeader + '</div>' +
            '<div class="codetabs-body">' + tabsContent + '</div>' +
        '</div>';
    }
}

module.exports = codetabs