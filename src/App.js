import React from "react";
import JsonViewer from "./JsonViewer";
import { sampledata, sampledata2 } from "./Sample";

const originalJson = sampledata;

const modifiedJson = sampledata2;

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>JSON Viewer</h1>
      <JsonViewer originalJson={originalJson} modifiedJson={modifiedJson} />
    </div>
  );
}

export default App;
