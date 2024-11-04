import React, { useState, useEffect, useRef } from "react";
import "./JsonViewer.css"; // Import the CSS file

const JsonViewer = ({ originalJson, modifiedJson }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [matches, setMatches] = useState([]);
  const [highlightedMatch, setHighlightedMatch] = useState(null);
  const originalTextAreaRef = useRef(null);
  const lineNumbersRefOriginal = useRef(null);
  const lineNumbersRefModified = useRef(null);
  const modifiedTextAreaRef = useRef(null);

  const originalString = JSON.stringify(originalJson, null, 2);
  const modifiedString = JSON.stringify(modifiedJson, null, 2);

  const getDifferences = () => {
    const originalLines = originalString.split("\n");
    const modifiedLines = modifiedString.split("\n");
    const diffIndices = [];

    modifiedLines.forEach((line, index) => {
      if (line !== originalLines[index]) {
        diffIndices.push(index);
      }
    });

    return diffIndices;
  };

  useEffect(() => {
    let newMatches;
    if (searchTerm.trim() === "") {
      newMatches = getDifferences();
    } else {
      newMatches = modifiedString
        .split("\n")
        .map((line, index) =>
          line.toLowerCase().includes(searchTerm.toLowerCase()) ? index : -1
        )
        .filter((index) => index !== -1);
    }
    setMatches(newMatches);
    setCurrentIndex(newMatches.length > 0 ? 0 : -1);
    setHighlightedMatch(null);
  }, [originalJson, modifiedJson, searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      if (originalTextAreaRef.current && lineNumbersRefOriginal.current) {
        lineNumbersRefOriginal.current.scrollTop =
          originalTextAreaRef.current.scrollTop;
      }
      if (modifiedTextAreaRef.current && lineNumbersRefModified.current) {
        lineNumbersRefModified.current.scrollTop =
          modifiedTextAreaRef.current.scrollTop;
      }
    };

    const originalTextArea = originalTextAreaRef.current;
    const modifiedTextArea = modifiedTextAreaRef.current;

    if (originalTextArea) {
      originalTextArea.addEventListener("scroll", handleScroll);
    }
    if (modifiedTextArea) {
      modifiedTextArea.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (originalTextArea) {
        originalTextArea.removeEventListener("scroll", handleScroll);
      }
      if (modifiedTextArea) {
        modifiedTextArea.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const scrollToMatch = (direction) => {
    if (currentIndex === -1 || matches.length === 0) return;

    const newIndex =
      (currentIndex + direction + matches.length) % matches.length;
    setCurrentIndex(newIndex);
    setHighlightedMatch(matches[newIndex]);

    const matchLine = matches[newIndex];
    const lineElement = document.querySelector(
      `.line:nth-child(${matchLine + 1})`
    );

    if (lineElement) {
      lineElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <div className="json-viewer-container">
      <div className="controls">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button
          onClick={() => scrollToMatch(-1)}
          disabled={currentIndex <= 0 || searchTerm.trim() === ""}
          className="control-button"
        >
          Previous
        </button>
        <button
          onClick={() => scrollToMatch(1)}
          disabled={
            currentIndex === matches.length - 1 || searchTerm.trim() === ""
          }
          className="control-button right-btn"
        >
          Next
        </button>
      </div>
      <div className="json-viewer">
        <div className="original-container">
          <div className="line-numbers" ref={lineNumbersRefOriginal}>
            {originalString.split("\n").map((_, index) => (
              <div key={index} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
          <textarea
            ref={originalTextAreaRef}
            value={originalString}
            readOnly
            className="textarea original"
          />
        </div>
        <div className="modified-container">
          <div className="line-numbers" ref={lineNumbersRefModified}>
            {modifiedString.split("\n").map((_, index) => (
              <div key={index} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
          <div className="modified-text" ref={modifiedTextAreaRef}>
            {modifiedString.split("\n").map((line, index) => {
              const isMatch = matches.includes(index);
              const isHighlighted = highlightedMatch === index;

              return (
                <div
                  key={index}
                  className={`line ${isMatch ? "diff-text" : ""}`}
                >
                  <span>
                    {line
                      .split(new RegExp(`(${searchTerm})`, "gi"))
                      .map((part, i) => (
                        <span
                          key={i}
                          className={
                            part.toLowerCase() === searchTerm.toLowerCase()
                              ? isHighlighted
                                ? "highlighted-result"
                                : "highlight"
                              : ""
                          }
                        >
                          {part}
                        </span>
                      ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
