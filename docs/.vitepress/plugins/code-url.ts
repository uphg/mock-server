import type { MarkdownItAsync } from 'markdown-it-async'
import container from 'markdown-it-container'
import type Token from 'markdown-it/lib/token.mjs'

const tabColorNamesMap = {
  GET: 'tab-get',
  POST: 'tab-post',
  DELETE: 'tab-delete',
  PUT: 'tab-put',
  PATCH: 'tab-patch',
  HEAD: 'tab-head',
  OPTIONS: 'tab-options'
}

export function codeURLPlugin(md: MarkdownItAsync) {
  md.use(container, 'code-url', {
    render(tokens: Token[], idx: number) {
      const token = tokens[idx]
      if (token.nesting === 1) {
        const title = token.info.trim().slice('code-url'.length).trim() || 'URL'
        const tabColorName = tabColorNamesMap[title as keyof typeof tabColorNamesMap]
        return (`
          <div class="vp-code-url">
            <div class="tabs">
              <div class="tab ${tabColorName}" >
                <span>${md.utils.escapeHtml(title)}</span>
              </div>
            </div>\n\n`
        )
      } else {
        return `</div>\n`
      }
    }
  })
}