import { getLanguageService } from "vscode-html-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";

const htmlLanguageService = getLanguageService();

const MARKUP_LANGUAGES = ["html", "xml", "vue", "php"];
const JSX_LANGUAGES = ["javascript", "typescript"]; // jsx / tsx files use these ids
const DEFAULT_LANGUAGES = [...MARKUP_LANGUAGES, ...JSX_LANGUAGES];

const toLspPosition = (p) => ({ line: p.lineNumber - 1, character: p.column - 1 });

const toMonacoRange = (r) => ({
    startLineNumber: r.start.line + 1,
    startColumn: r.start.character + 1,
    endLineNumber: r.end.line + 1,
    endColumn: r.end.character + 1,
});

// Parse once per model version, so cursor moves don't re-parse the whole file
const parseCache = new WeakMap();
function parse(model) {
    const version = model.getVersionId();
    const hit = parseCache.get(model);
    if (hit && hit.version === version) return hit;

    const document = TextDocument.create(model.uri.toString(), "html", version, model.getValue());
    const htmlDocument = htmlLanguageService.parseHTMLDocument(document);
    const entry = { version, document, htmlDocument };
    parseCache.set(model, entry);
    return entry;
}

// ---- JSX guards: keep `=>` and TS generics from being treated as tags ----
function isJsxTagEnd(before) {
    const lt = before.lastIndexOf("<");
    if (lt === -1) return false;

    const tag = before.slice(lt);
    if (!/^<[A-Za-z]/.test(tag)) return false;   // must start like <div or <Foo
    if (tag.endsWith("=>")) return false;         // arrow function

    let depth = 0;                                // inside {...}, e.g. onClick={() => ...}
    for (const ch of tag) {
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
    }
    if (depth !== 0) return false;

    const prev = before[lt - 1];                  // Array<string>, useState<number>, foo<T>
    if (prev && /[\w$\])]/.test(prev)) return false;

    return true;
}

function getCloseSnippet(model, position, typedChar) {
    const { document, htmlDocument } = parse(model);
    const lsp = toLspPosition(position);
    const offset = document.offsetAt(lsp);
    const before = document.getText().slice(Math.max(0, offset - 2000), offset);

    if (JSX_LANGUAGES.includes(model.getLanguageId())) {
        if (typedChar === ">") {
            if (/(?:^|[^\w$\])])<>$/.test(before)) return "$0</>"; // fragment
            if (!isJsxTagEnd(before)) return null;
        } else if (!before.endsWith("</")) {
            return null;
        }
    }

    return htmlLanguageService.doTagComplete(document, lsp, htmlDocument);
}

export function enableAutoCloseTag(editor, monaco, { languages = DEFAULT_LANGUAGES } = {}) {
    // 1) typing ">" completes the tag, typing "</" completes the closing tag
    const contentListener = editor.onDidChangeModelContent((event) => {
        if (event.isFlush || event.isUndoing || event.isRedoing) return;
        if (event.changes.length !== 1) return;

        const change = event.changes[0];
        if ((change.text !== ">" && change.text !== "/") || change.rangeLength !== 0) return;

        const model = editor.getModel();
        if (!model || !languages.includes(model.getLanguageId())) return;

        // caret position right after the typed character
        const position = { lineNumber: change.range.startLineNumber, column: change.range.startColumn + 1 };
        const versionId = model.getVersionId();

        // wait until Monaco has finished this keystroke
        queueMicrotask(() => {
            if (editor.getModel() !== model || model.getVersionId() !== versionId) return;

            const sel = editor.getSelection();
            if (!sel || !sel.isEmpty()) return;
            if (sel.positionLineNumber !== position.lineNumber || sel.positionColumn !== position.column) return;

            const snippet = getCloseSnippet(model, position, change.text);
            if (!snippet) return;

            editor.getContribution("snippetController2")?.insert(snippet);
        });
    });

    // 2) Enter between <div>|</div> puts the closing tag on its own line
    const keyListener = editor.onKeyDown((e) => {
        if (e.keyCode !== monaco.KeyCode.Enter) return;
        if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

        const model = editor.getModel();
        if (!model || !languages.includes(model.getLanguageId())) return;

        // let Enter accept a suggestion when the suggest widget is open
        if (editor.getDomNode()?.querySelector(".suggest-widget.visible")) return;

        const sel = editor.getSelection();
        if (!sel || !sel.isEmpty()) return;

        const line = model.getLineContent(sel.positionLineNumber);
        const before = line.slice(0, sel.positionColumn - 1);
        const after = line.slice(sel.positionColumn - 1);

        if (before.endsWith("/>")) return;
        const open = before.match(/<([A-Za-z][\w.:-]*)?(?:\s[^<>]*)?>$/);
        const close = after.match(/^<\/([A-Za-z][\w.:-]*)?\s*>/);
        if (!open || !close || (open[1] ?? "") !== (close[1] ?? "")) return;

        e.preventDefault();
        e.stopPropagation();
        editor.getContribution("snippetController2")?.insert("\n\t$0\n");
    });

    return {
        dispose() {
            contentListener.dispose();
            keyListener.dispose();
        },
    };
}

// Editing a tag name also renames its matching tag (like VS Code's linked editing)
const registeredLanguages = new Set();

export function registerLinkedEditingTags(monaco, { languages = DEFAULT_LANGUAGES } = {}) {
    languages.forEach((language) => {
        if (registeredLanguages.has(language)) return;
        registeredLanguages.add(language);

        monaco.languages.registerLinkedEditingRangeProvider(language, {
            provideLinkedEditingRanges(model, position) {
                const { document, htmlDocument } = parse(model);
                const ranges = htmlLanguageService.findLinkedEditingRanges(
                    document,
                    toLspPosition(position),
                    htmlDocument
                );
                if (!ranges) return null;
                return {
                    ranges: ranges.map(toMonacoRange),
                    wordPattern: /[A-Za-z][\w:.-]*/, // allows Foo.Bar and my-tag
                };
            },
        });
    });
}