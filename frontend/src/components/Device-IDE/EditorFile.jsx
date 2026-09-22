import Editor from "@monaco-editor/react";
import { useRef, useEffect } from "react";
import { enableAutoCloseTag, registerLinkedEditingTags } from "./autoCloseTag";

export default function EditorFile({ file, onChange, fontsize = 14, lineHeight = 20 }) {
    const editorRef = useRef(null);
    const recentEmits = useRef([]);
    const currentFileId = useRef(file.id);
    const autoCloseTagDisposableRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        autoCloseTagDisposableRef.current = enableAutoCloseTag(editor, monaco);
    };

    useEffect(() => {
        return () => {
            autoCloseTagDisposableRef.current?.dispose();
        };
    }, []);

    const handleEditorChange = (value) => {
        recentEmits.current = [...recentEmits.current.slice(-9), value];
        onChange(value);
    };

    useEffect(() => {
        if (!editorRef.current) return;
        if (file.id !== currentFileId.current) {
            currentFileId.current = file.id;
            recentEmits.current = [];
            return;
        }
        if (recentEmits.current.includes(file.content)) return; // echo of our own typing

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
        registerLinkedEditingTags(monaco);
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
                    cursorBlinking: "blink",
                    smoothScrolling: true,
                    bracketPairColorization: { enabled: true },
                    // Required for registerLinkedEditingTags() above to activate.
                    linkedEditing: true,
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