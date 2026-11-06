import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RichText } from "@/lib/rich-text";

describe("RichText", () => {
  it("renders headings, bold, highlight, links and lists", () => {
    const html = renderToStaticMarkup(
      <RichText text={"## Results\n\nWe grew **40%** with ==one system== and [a link](https://example.com).\n\n- First\n- Second"} />,
    );
    expect(html).toContain("<h2");
    expect(html).toContain("<strong");
    expect(html).toContain("40%");
    expect(html).toContain("<mark");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
  });

  it("never renders raw HTML from content", () => {
    const html = renderToStaticMarkup(<RichText text={'<script>alert("x")</script>'} />);
    expect(html).not.toContain("<script>");
  });

  it("renders nothing for empty content", () => {
    expect(renderToStaticMarkup(<RichText text="" />)).toBe("");
  });
});
