import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import PropTypes from "prop-types";
export default function MarkdownWithPlugins({ children }) {
  return <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>;
}

MarkdownWithPlugins.propTypes = {
  children: PropTypes.node.isRequired,
};
