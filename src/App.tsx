import React, { useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Box, Typography } from "@mui/material";
import RunButton from "./RunButton";
import * as monaco from "monaco-editor";

const defaultCode = `console.log("Hello World!");`;

function App() {
  const [, setEditor] = useState<
    monaco.editor.IStandaloneCodeEditor | undefined
  >();
  const [content, setContent] = useState<string>(defaultCode);
  const [output, setOutput] = useState("");
  const run = () => {
    setOutput("");
    const preCode = `
console.log = (...args) => { self.postMessage({type: "log", args: args})};
`;
    const code = content ?? "";
    const postCode = `
self.postMessage({type: "terminate"})`;
    const fullCode = preCode + code + postCode;
    const blob = new Blob([fullCode], {
      type: "text/javascript",
    });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    w.onerror = (ev) => {
      console.log(ev);
    };
    w.onmessage = (ev) => {
      if (ev.data.type === "terminate") {
        w.terminate();
        URL.revokeObjectURL(url);
        return;
      }

      if (ev.data.type === "log") {
        setOutput((output) => output + ev.data.args.join(" ") + "\n");
        return;
      }
    };
  };

  const onChange = (
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) => {
    setContent(value ?? "");
  };

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    setEditor(editor);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Editor
        value={content}
        onMount={onMount}
        onChange={onChange}
        options={{ fontSize: 25 }}
        defaultLanguage="javascript"
        theme={"vs-dark"}
      />

      <Box
        sx={{ height: "300px", overflow: "scroll", backgroundColor: "#ddd" }}
      >
        <Typography sx={{ whiteSpace: "pre-wrap" }}>{output}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <RunButton onRun={run} sx={{ width: "100%" }} />
      </Box>
    </Box>
  );
}

export default App;
