'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Highlight } from '@tiptap/extension-highlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Undo, Redo, Maximize2, Minimize2, Sparkles, Trash2, Plus, Minus, X
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your thoughts here...',
  minHeight = '240px',
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [tableMenuOpen, setTableMenuOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline font-medium hover:text-blue-300',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content p-4 focus:outline-none max-w-none text-slate-100 text-xs sm:text-sm leading-relaxed',
        style: `min-height: ${minHeight};`,
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkModalOpen(false);
    setLinkUrl('');
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageModalOpen(false);
    setImageUrl('');
  };

  return (
    <div
      className={`border border-slate-800 rounded-xl bg-slate-950 overflow-hidden shadow-lg transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl bg-slate-950 border-slate-700' : ''
      }`}
    >
      {/* Top Menu Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2 flex flex-wrap items-center gap-1 text-slate-300 select-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-800">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-800">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Formats */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-800">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('highlight')
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Highlight Text"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('code')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-800">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-800">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('blockquote')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-800">
          <button
            type="button"
            onClick={() => setLinkModalOpen(true)}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('link')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTableMenuOpen(!tableMenuOpen)}
            className={`p-1.5 rounded-lg cursor-pointer ${
              editor.isActive('table')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Table Tools"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Table Dropdown Menu */}
      {tableMenuOpen && (
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="font-bold text-blue-400">Table:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 cursor-pointer"
          >
            + Insert 3x3 Table
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
          >
            + Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            className="px-2 py-0.5 bg-red-950/60 border border-red-800 text-red-300 rounded-md hover:bg-red-900/60 disabled:opacity-30 cursor-pointer"
          >
            - Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            className="px-2 py-0.5 bg-red-950/60 border border-red-800 text-red-300 rounded-md hover:bg-red-900/60 disabled:opacity-30 cursor-pointer"
          >
            - Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="px-2 py-0.5 bg-red-600 text-white rounded-md hover:bg-red-500 disabled:opacity-30 cursor-pointer font-bold"
          >
            Delete Table
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className={`overflow-y-auto bg-slate-950 ${isFullscreen ? 'flex-1 p-6' : ''}`}>
        <div className={isFullscreen ? 'max-w-4xl mx-auto bg-slate-950 rounded-xl border border-slate-800' : ''}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                <span>Insert or Edit Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={setLink}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold cursor-pointer"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Insert Image URL</span>
              </h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addImage}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold cursor-pointer"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
