import React from "react";
import Markdown from "react-markdown";
import PropTypes from "prop-types";

export default function MarkdownPreviewer({ children, text }) {
  const [previewPressed, setPreviewPressed] = React.useState(false);
  const [animated, setAnimated] = React.useState(false);
  const markdownRef = React.useRef(null);
  React.useEffect(() => {
    if (text) {
      const lines = text.split("\n");
      console.log("lines", lines);
      console.log(markdownRef.current);
      if (markdownRef.current) {
        console.log("markdown ref", markdownRef.current.children);
      }
    }
  }, [text]);
  return (
    <div
      onClick={() => {
        console.log("click");
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
        <div className="w-full h-64 max-h-[25vh] min-h-24 px-3 border border-gray-500 bg-gray-700 text-white shadow-sm overflow-auto">
          <span className="font-bold">Markdown Preview</span>
          <div ref={markdownRef} className="markdown text-left text-xs">
            <Markdown>{text}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

MarkdownPreviewer.propTypes = {
  children: PropTypes.node,
  text: PropTypes.string.isRequired,
};
