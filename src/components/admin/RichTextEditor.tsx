"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
};

const BUTTONS: { label: string; command: string; value?: string; title: string }[] = [
  { label: "H2", command: "formatBlock", value: "H2", title: "Titre" },
  { label: "H3", command: "formatBlock", value: "H3", title: "Sous-titre" },
  { label: "P", command: "formatBlock", value: "P", title: "Paragraphe" },
  { label: "B", command: "bold", title: "Gras" },
  { label: "I", command: "italic", title: "Italique" },
  { label: "•", command: "insertUnorderedList", title: "Liste à puces" },
  { label: "1.", command: "insertOrderedList", title: "Liste numérotée" },
  { label: "”", command: "formatBlock", value: "BLOCKQUOTE", title: "Citation" },
  { label: "—", command: "insertHorizontalRule", title: "Séparateur" }
];

/**
 * Minimal, dependency-free rich text editor for admin content fields.
 * Stores HTML in a hidden input matching `name`, so it works inside any
 * <form action={serverAction}> without extra wiring.
 */
export default function RichTextEditor({ name, label, defaultValue = "" }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function addLink() {
    const url = window.prompt("URL du lien :");
    if (url) exec("createLink", url);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input type="hidden" name={name} value={html} />

      <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-line bg-offwhite p-1.5">
        {BUTTONS.map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.title}
            onClick={() => exec(b.command, b.value)}
            className="rounded px-2.5 py-1.5 text-xs font-semibold hover:bg-white"
          >
            {b.label}
          </button>
        ))}
        <button type="button" title="Lien" onClick={addLink} className="rounded px-2.5 py-1.5 text-xs font-semibold hover:bg-white">
          🔗
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => setHtml(editorRef.current?.innerHTML ?? "")}
        onBlur={() => setHtml(editorRef.current?.innerHTML ?? "")}
        dangerouslySetInnerHTML={{ __html: defaultValue }}
        className="min-h-[220px] rounded-b-md border border-line px-3.5 py-3 text-sm leading-relaxed focus:outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-red [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-red [&_a]:underline"
      />
      <p className="text-xs text-ink-soft">
        Titres, gras, italique, listes, citations, liens et séparateurs — pas besoin d&apos;écrire du HTML.
      </p>
    </div>
  );
}
