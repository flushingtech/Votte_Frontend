import React from "react";
import Markdown from "react-markdown";
import PropTypes from "prop-types";

export default function MarkdownPreviewer({ children, text }) {
  const [previewPressed, setPreviewPressed] = React.useState(false);
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
    <>
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
        <span className="text-gray-500 mx-2">
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
    </>
  );
}

MarkdownPreviewer.propTypes = {
  children: PropTypes.node,
  text: PropTypes.string.isRequired,
};
