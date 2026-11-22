// Finds where the practice tools go on a lesson or LeetCode page: right after
// the block in the 「練習」 section that links to the exercise files.

export type PracticeSpot = {
  /** Insert new content after this element. */
  after: Element;
  /** Repository paths of the exercise files, in page order, without duplicates. */
  files: string[];
};

export function findPracticeSpot(
  root: ParentNode = document,
): PracticeSpot | undefined {
  const heading = Array.from(root.querySelectorAll(".prose h2")).find((h2) =>
    (h2.textContent ?? "").trim().startsWith("練習"),
  );
  const blocks: Element[] = [];
  if (heading) {
    for (
      let node = heading.nextElementSibling;
      node && node.tagName !== "H2";
      node = node.nextElementSibling
    ) {
      if (node.querySelector("a[data-exercise]")) blocks.push(node);
    }
  }
  const links = Array.from(
    (blocks.length > 0
      ? blocks
      : Array.from(root.querySelectorAll(".prose"))
    ).flatMap((block) =>
      Array.from(block.querySelectorAll<HTMLAnchorElement>("a[data-exercise]")),
    ),
  );
  const files = [
    ...new Set(
      links.map((link) => link.dataset.exercise ?? "").filter(Boolean),
    ),
  ];
  const after =
    blocks.at(-1) ?? links.at(-1)?.closest("p, .table-wrap, ul, ol");
  if (!after || files.length === 0) return undefined;
  return { after, files };
}
