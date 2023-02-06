import { unified } from 'unified';
import RemarkParse from 'remark-parse';
import gfm from 'remark-gfm'
import RemarkRehype from 'remark-rehype'

import toHtml from 'rehype-stringify'
import toc from 'rehype-toc'
// import slug from 'rehype-slug'
// import prism from 'rehype-prism'

import prism from 'remark-prism'
import slug from 'remark-slug'

// example of parsing a markdown string to html with unified and rehype-toc
export default async function markdownToHtml(markdown) {
  const result = await unified()
    .use(RemarkParse, { sanitize: false })
    .use(gfm)
    .use(prism)
    .use(slug)
    .use(RemarkRehype)
    // use rehype-toc to generate a table of contents
    .use(toc, {
      headings: ["h1","h2", "h3", "h4"],
      cssClasses: {
        toc: "page-outline",
        link: "page-link",
      },
      customizeTOC: (tocAST) => {
        tocAST.children.forEach((node) => {
          if (node.tagName === "ol") {
            node.tagName = "ul"
          }
        })
        return tocAST
      },
    })
    // define a custom ast function to move toc under heading with id "table-of-contents"
    .use(() => (tree) => {
      if (!tree.children) return tree
      const toc = tree.children.find((node) => node.tagName === "nav")
      const tocHeading = tree.children.find(
        (node) =>{
          return node.properties && node.properties.id === "table-of-contents"
        }
      )
      if (tocHeading && toc) {
        // move the toc after toc heading
        const tocIndex = tree.children.indexOf(toc)
        tree.children.splice(tocIndex, 1)
        const tocHeadingIndex = tree.children.indexOf(tocHeading)
        tree.children.splice(tocHeadingIndex + 1, 0, toc)
        // remove the toc heading from the tree
        tree.children.splice(tocHeadingIndex, 1)

      }

      const tocDiv = {
        type: "element",
        tagName: "details",
        properties: {
          className: ["toc-container"],
        },
        children: [toc],
      }
      // open the details element
      tocDiv.properties.open = true
      // a summary element to the details element
      tocDiv.children.unshift({
        type: "element",
        tagName: "summary",
        properties: {
          className: ["toc-summary"],
        },
        children: [
          {
            type: "text",
            value: "Table of Contents",
          },
        ],
      })
      // replace the toc with the new tocDiv
      const index = tree.children.indexOf(toc)
      tree.children.splice(index, 1, tocDiv)
      
      // find and remove the value "table-of-contents" from table-of-contents list
      if (toc) {
        const tocList = toc.children[0].children
        tocList.forEach((item) => {
          if (item.children[0].properties.href === "#table-of-contents") {
            const index = tocList.indexOf(item)
            tocList.splice(index, 1)
          }
        })
      }
      return tree
    })
    .use(toHtml, { allowDangerousHtml: true })
    .process(markdown)

  return result.toString()
}