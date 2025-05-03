import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";

import Markdown from "react-markdown";
import PropTypes from "prop-types";
export default function MarkdownWithPlugins({
  children,
  className = "prose prose-sm",
}) {
  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        rehypePlugins={[rehypeRaw]}
      >
        {children}
      </Markdown>
    </div>
  );
}

MarkdownWithPlugins.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
