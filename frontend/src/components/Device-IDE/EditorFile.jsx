import Editor from "@monaco-editor/react";
import { useRef, useEffect } from "react";

export default function EditorFile({ file, onChange, fontsize = 14, lineHeight = 20}) {
    const editorRef = useRef(null);
    const currentFileId = useRef(file.id);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value) => {
        onChange(value);
    };

    useEffect(() => {
        if (!editorRef.current) return;
        if (file.id !== currentFileId.current) {
            currentFileId.current = file.id;
            return;
        }
        const editor = editorRef.current;
        if (editor.getValue() !== file.content) {
            const model = editor.getModel();
            const position = editor.getPosition();
            model.pushEditOperations(
                [],
                [{ range: model.getFullModelRange(), text: file.content }],
                () => null
            );
            editor.setPosition(position);
        }
    }, [file.content, file.id]);
    
    const handleBeforeMount = (monaco) => {
        monaco.editor.defineTheme("pure-black", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#181818",
            },
        });
    };
    return (
        <div className="min-h-0 min-w-0 h-full flex-1">
            <Editor
                height="100%"
                theme="pure-black"
                beforeMount={handleBeforeMount}
                language={file.language}
                path={file.id}
                defaultValue={file.content}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                options={{
                    fontFamily: "Cascadia Code",
                    fontSize: fontsize,
                    lineHeight: lineHeight,
                    tabSize: 4,
                    indentSize: 4,
                    insertSpaces: true,
                    detectIndentation: false,
                    autoIndent: "full",
                    formatOnPaste: true,
                    formatOnType: true,
                    automaticLayout: true,
                    minimap: { enabled: true },
                    lineNumbers: "on",
                    folding: true,
                    wordWrap: "off",
                    scrollBeyondLastLine: false,
                    cursorBlinking: "",
                    smoothScrolling: true,
                    bracketPairColorization: { enabled: true },
                    guides: {
                        indentation: true,
                        bracketPairs: true,
                    },
                    padding: {
                        top: 10,
                        bottom: 10,
                    },
                    scrollbar: {
                        verticalScrollbarSize: 0,
                        horizontalScrollbarSize: 10,
                    },
                }}
            />
        </div>
    );
}