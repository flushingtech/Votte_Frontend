import React from "react";
import PropTypes from "prop-types";
import removeMd from "remove-markdown";
import MarkdownWithPlugins from "./MarkdownWithPluggins";

export default function MarkdownPreviewer({ children, text, textRef }) {
  const [previewPressed, setPreviewPressed] = React.useState(false);
  const [animated, setAnimated] = React.useState(false);
  const markdownRef = React.useRef(null);
  React.useEffect(() => {
    if (textRef.current && markdownRef.current) {
      renewEventListener(textRef.current, "click", syncPreviewHandler);
      renewEventListener(textRef.current, "keyup", syncPreviewHandler);
      if (text) syncPreviewHandler();
    }
    function findLineNumber(text, position) {
      const diff = text.length - removeMd(text).length;
      const adjustedPosition =
        position - Math.round(diff * (position / text.length));
      let wordCount = 0;
      const lines = removeMd(text)
        .split("\n")
        .filter((line) => line.trim() !== "");
      const lineNumber = lines.findIndex((line, i, arr) => {
        wordCount += line.length;
        if (wordCount >= adjustedPosition || i === arr.length - 1) {
          return true;
        }
        return false;
      });
      return lineNumber / lines.length;
    }
    function syncPreviewHandler() {
      const cursorPosition = textRef.current.selectionStart;
      const cursorLine = findLineNumber(text, cursorPosition);
      const previewElements = markdownRef.current.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, ul, ol, li, blockquote, pre"
      );
      const previewLine = Math.min(
        Math.round(cursorLine * previewElements.length),
        previewElements.length - 1
      );
      previewElements[previewLine].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [text, previewPressed, textRef]);
  function renewEventListener(node, eventType, handler) {
    if (node) {
      node.removeEventListener(eventType, handler);
      node.addEventListener(eventType, handler);
    }
  }
  return (
    <div
      onClick={() => {
        setAnimated(true);
      }}
    >
      <div className="border border-gray-500 text-left">
        <button
          type="button"
          className={`py-1 px-2 bg-gray-700 text-gray-400 border-2 ${
            previewPressed
              ? "border-t-gray-500 border-r-gray-300 border-b-gray-300 border-l-gray-500 shadow-[-1px_-1px_0px_gray]"
              : "border-t-gray-300 border-r-gray-500 border-b-gray-500 border-l-gray-300 shadow-[1px_1px_0px_gray]"
          } cursor-pointer`}
          onClick={() => setPreviewPressed((prev) => !prev)}
        >
          Preview
        </button>
        <span
          className={
            "text-lg mx-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-400 from-45% via-white via-50% to-gray-400 to-55% bg-[length:200%_auto] bg-[position:110%_0%]" +
            (animated ? " animate-shimmer" : "")
          }
        >
          Votte now supports Markdown. Try it on!
        </span>
      </div>
      {children}
      {previewPressed && (
        <div className="w-full h-64 max-h-[25vh] min-h-24 px-3 border border-gray-500 bg-gray-700 text-white shadow-sm overflow-auto text-center">
          <span className="font-bold">Markdown Preview</span>
          <div ref={markdownRef} className="markdown text-left text-xs">
            <MarkdownWithPlugins>{text}</MarkdownWithPlugins>
          </div>
        </div>
      )}
    </div>
  );
}

MarkdownPreviewer.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  textRef: PropTypes.object,
};
