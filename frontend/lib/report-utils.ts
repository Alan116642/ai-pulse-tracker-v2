export type ParsedReportItem = {
  text: string;
  url?: string;
};

export type ParsedReportSection = {
  title: string;
  items: ParsedReportItem[];
};

function extractUrl(line: string) {
  const match = line.match(/https?:\/\/\S+/);
  return match?.[0]?.replace(/[)>\]}]+$/, "");
}

function normalizeItemText(line: string) {
  return line
    .replace(/^- /, "")
    .replace(/[#*`]/g, "")
    .replace(/\s*[｜|]\s*主源[:：]?\s*https?:\/\/\S+/g, "")
    .replace(/\s*[｜|]\s*来源[:：]?\s*https?:\/\/\S+/g, "")
    .trim();
}

export function parseReportSections(markdown: string) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: ParsedReportSection[] = [];
  let current: ParsedReportSection = { title: "摘要", items: [] };

  for (const line of lines) {
    if (line.startsWith("#")) {
      if (current.items.length > 0 || current.title !== "摘要") {
        sections.push(current);
      }
      current = {
        title: line.replace(/^#+\s*/, "").trim(),
        items: []
      };
      continue;
    }

    current.items.push({
      text: normalizeItemText(line),
      url: extractUrl(line)
    });
  }

  if (current.items.length > 0 || sections.length === 0) {
    sections.push(current);
  }

  return sections;
}
