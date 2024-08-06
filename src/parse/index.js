
/**
 * @description: 
 * @param {string} str
 * @return {{
 *  width: string      // 宽度 如 "300px"   png有效    暂无计划
 *  height: string      // 高度 如 "100px"   png有效    <暂无计划>
 *  alt: string         // 替换文本 png有效             <暂无计划>  
 *  title: string       // tab 名称          (png 名称 <暂无计划>)  
 *  code_block: boolean // 是否是代码块
 *  as: string          // 替换指定类型代码块 如 "js"
 *  line_begin: number  // 代码块开始行    从 0行开始， 0最小值
 *  line_end: number    // 代码块结束行     0 为最大值 尾部不包含设置值
 *  group: string       // 分组名
 *  tabname: string     // 当未指定 tab 名称时，默认为 后缀模式   (ext: 默认后缀 | file: 文件名)
 *  commit_file: boolean  // 是否在 第一行加入文件名， 默认false
 * }}
 */
function HtmlAttr2Obj(str) {
    if (!str) {
        return {}
    }
    let validStr = str.replace(/(\w+)=(\d+|"(?:\\.|[^"])*"|true|false)/g, '"$1": $2,')
    validStr = validStr.replace(/,}$/, '}') // 此替换 把 \" 替换成了 "  故不能采用了
    // console.log('validStr:', validStr)
    return JSON.parse(validStr)
}


/**
 * @description: 
 * @param {{
 *  width: string     
 *  height: string      
 *  alt: string         
 *  title: string       
 *  code_block: boolean 
 *  as: string          
 *  line_begin: number  
 *  line_end: number    
 *  group: string       
 *  tabname: string     
 *  commit_file: boolean
 * }} obj
 * @return {string}
 */
function ObjToHtmlAttr(obj) {
    let str = ''
    for (let key in obj) {

        const typeValue = typeof obj[key]
        if (typeValue === 'string') {
            const value = `${obj[key]}`.replace(/"/g, '\\"')
            str += `${key}="${value}" `
        }else{
            str += `${key}=${obj[key]} `
        }

    }
    str = str.trimEnd()
    if (str === ""){
        return str
    }
    return `{${str}}`
}

/**
 * @description: 
 * @param {{
*  width: string     
*  height: string      
*  alt: string         
*  title: string       
*  code_block: boolean 
*  as: string          
*  line_begin: number  
*  line_end: number    
*  group: string       
*  tabname: string     
*  commit_file: boolean
* }} obj
* @return {string}
*/
function ClearNoTabInfo(obj) {
    for (let key in obj) {
        if (key !== 'title' && 
            key !== 'group'
        ) {
            delete obj[key]
        }
    }
    // console.log("result obj:", obj)
}


/**
 * @description: 获取行注释字符串
 * @param {string} lang
 * @param {string} commit 注释字符串
 * @return {*}
 */
function SetCodeCommit(lang, commit) {
    switch (lang) {
        case 'html':
            return `<!-- ${commit} -->`
        case 'css':
            return `/* ${commit} */`
        case 'python', 'py':
            return `# ${commit}`
        default:
            return `// ${commit}`
    }
}

module.exports = {
    HtmlAttr2Obj,
    ObjToHtmlAttr,
    SetCodeCommit,
    ClearNoTabInfo
}