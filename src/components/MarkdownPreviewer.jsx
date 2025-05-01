import React from "react";
import Markdown from "react-markdown";
import PropTypes from "prop-types";

export default function MarkdownPreviewer({ children, text }) {
  const [previewPressed, setPreviewPressed] = React.useState(false);
  return (
    <>
      <div className="border border-gray-500 text-left">
        <button
          type="button"
          className={`py-1 px-2 bg-gray-700 text-gray-400 border-2 ${
            previewPressed
              ? "border-t-[#808080] border-r-[#dfdfdf] border-b-[#dfdfdf] border-l-[#808080] shadow-inner"
              : "border-t-[#dfdfdf] border-r-[#808080] border-b-[#808080] border-l-[#dfdfdf] shadow"
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
          <div className="markdown text-left text-xs">
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
