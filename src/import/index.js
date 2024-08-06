const fs = require("fs");
const fsPromises = fs.promises; // 导入 fs.promises
console.log('fs.promises:', fs.promises); // 检查 fs.promises 是否定义

const PathUtil = require("path");

const { HtmlAttr2Obj, ObjToHtmlAttr, SetCodeCommit, ClearNoTabInfo } = require("../parse")

/**
 * 
 * @param {string} rawPath 
 * @param {string} textData 
 * @returns 
 */
async function replaceContent(rawPath, textData) {
  // 将文本数据分割成行
  const lines = textData.split("\n");

  rawPath = PathUtil.dirname(rawPath);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("@import \"")) {
      // console.log(`line[${i}]: ${lines[i]}`)
      const res = lines[i].match(/@import "([^"]+)"[ \t]*(?:({.+}))?/)
      if (res) {
        const importPath = PathUtil.isAbsolute(res[1])
          ? res[1]
          : rawPath + "/" + res[1];

        let infoStr = res[2] || ""
        // console.log('infostr:', infoStr)
        const info = HtmlAttr2Obj(infoStr)

        let baseName = PathUtil.basename(importPath)
        let extName = info.as || PathUtil.extname(importPath).slice(1);

        if (info.tabname){
          if (info.tabname === "file") 
            info.title = baseName
        }

        // console.info("path: ", importPath, "extName: ", extName, 'info:', info);

        // 读取文件内容
        try {
          let fileContent = ""

          if (info.commit_file) {
            fileContent = SetCodeCommit(importPath, baseName) + "\n"
          }

          if (info.line_begin || info.line_end) {
            fileContent += await readLinesRange(info, importPath)
          }else{
            fileContent += await readFileAsync(importPath, "utf8");
          }
          // console.log('xxx fileContent:', fileContent)

          if (!fileContent.endsWith("\n")) {
            fileContent += "\n"
          }

          // 删除不必要的属性
          const codeBlock = info.code_block
          ClearNoTabInfo(info)
          infoStr = ObjToHtmlAttr(info)
          // console.log("res infoStr:", infoStr)

          // 替换@import行为文件内容
          let line = "```" + extName + " " + infoStr + "\n" + fileContent + "```\n";

          if (codeBlock) {
            line = `{% raw %}\n${line}{% endraw %}\n`
          }

          lines[i] = line
          // console.log('line:', lines[i])
        } catch (err) {
          console.error(`无法读取文件: ${err}`);
        }
      }
    }
  }

  // 重新将文本数据合并成字符串
  textData = lines.join("\n");

  return textData;
}

/**
 * @description: 
 * @param {{
 *  width: string      // 宽度 如 "300px"   png有效    暂无计划
 *  height: string      // 高度 如 "100px"   png有效    <暂无计划>
 *  alt: string         // 替换文本 png有效             <暂无计划>  
 *  title: string       // tab 名称          (png 名称 <暂无计划>)  
 *  code_block: boolean // 是否是代码块
 *  as: string          // 替换指定类型代码块 如 "js"
 *  line_begin: number  // 代码块开始行
 *  line_end: number    // 代码块结束行
 *  group: string       // 分组名
 *  tabname: string     // 当未指定 tab 名称时，默认为 后缀模式   (ext: 默认后缀 | file: 文件名)
 *  commit_file: boolean  // 是否在 第一行加入文件名， 默认false
 * }} info
 * @param {string} filePath 文件路径
 * @return {string}
 */
function readLinesRange(info, filePath) {
  return new Promise((resolve, reject) => {
    let lineCount = 0;
    let collectedLines = '';
    const startLine = info.line_begin ? info.line_begin : 0;
    let endLine = info.line_end && info.line_end != 0 ? info.line_end  : Number.MAX_SAFE_INTEGER;
    // console.log('line_start:', startLine, 'line end:', endLine)
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

    stream.on('data', (chunk) => {
      let lines = chunk.split('\n');
      for (let line of lines) {

        if (lineCount >= startLine && lineCount < endLine) {
          collectedLines += line + '\n';
        }
        lineCount++;

        // console.log('collectedLines:', collectedLines)
      }
    });

    stream.on('end', () => {
      // 移除最后一行多余的换行符
      collectedLines = collectedLines.trimEnd();
      resolve(collectedLines);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 封装 fs.readFile 为返回 Promise 的函数
 * @param {string} path 文件路径
 * @param {string} [encoding] 编码方式
 * @returns {Promise<string>} 文件内容的 Promise
 */
function readFileAsync(path, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = replaceContent

