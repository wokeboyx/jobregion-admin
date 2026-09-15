function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function inlineFormat(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
}

export function renderMarkdown(markdown: string): string {
  const escaped = escapeHtml(markdown)
  const lines = escaped.split("\n")
  const html: string[] = []
  let listOpen = false
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${inlineFormat(paragraph.join(" "))}</p>`)
      paragraph = []
    }
  }

  const closeList = () => {
    if (listOpen) {
      html.push("</ul>")
      listOpen = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line === "") {
      flushParagraph()
      closeList()
      continue
    }

    const headingMatch = line.match(/^(#{1,2})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      closeList()
      const level = headingMatch[1].length === 1 ? "h2" : "h3"
      html.push(`<${level}>${inlineFormat(headingMatch[2])}</${level}>`)
      continue
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/)
    if (bulletMatch) {
      flushParagraph()
      if (!listOpen) {
        html.push("<ul>")
        listOpen = true
      }
      html.push(`<li>${inlineFormat(bulletMatch[1])}</li>`)
      continue
    }

    closeList()
    paragraph.push(line)
  }

  flushParagraph()
  closeList()

  return html.join("\n")
}
