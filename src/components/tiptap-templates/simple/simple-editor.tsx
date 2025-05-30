"use client"

import * as React from "react"
import {
	Content,
	EditorContent,
	EditorContext,
	useEditor,
} from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';

// --- Custom Extensions ---
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { NodeButton } from '@/components/tiptap-ui/node-button';
import {
	HighlightPopover,
	HighlightContent,
	HighlighterButton,
} from '@/components/tiptap-ui/highlight-popover';
import {
	LinkPopover,
	LinkContent,
	LinkButton,
} from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';

// --- Hooks ---
import { useMobile } from '@/hooks/use-mobile';
import { useWindowSize } from '@/hooks/use-window-size';

// --- Components ---
import { ThemeToggle } from '@/components/tiptap-templates/simple/theme-toggle';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';

// import content from "@/components/tiptap-templates/simple/data/content.json"
import { useEffect, useMemo, useRef, useState } from 'react';
import { CommentMark } from '@/components/tiptap-extension/comment-mark';
import useAnchors from '@/hooks/use-anchor';
import { Journal } from '@/models/Journal';
import { upsert_journal } from '@/lib/journal';
import { getRandomId } from '@/lib/string';
import { getTodaysDate } from '@/lib/date/date';
import { useChat } from '@ai-sdk/react';

const sampleComments = [
	{ id: 'c1', text: 'Nice hook for newcomers.' },
	{ id: 'c2', text: 'Maybe link directly to the CLI docs here?' },
];

const MainToolbarContent = ({
	onHighlighterClick,
	onLinkClick,
	isMobile,
}: {
	onHighlighterClick: () => void;
	onLinkClick: () => void;
	isMobile: boolean;
}) => {
	return (
		<>
			<Spacer />

			<ToolbarGroup>
				<UndoRedoButton action='undo' />
				<UndoRedoButton action='redo' />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<HeadingDropdownMenu levels={[1, 2, 3, 4]} />
				<ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />
				<NodeButton type='codeBlock' />
				<NodeButton type='blockquote' />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type='bold' />
				<MarkButton type='italic' />
				<MarkButton type='strike' />
				<MarkButton type='code' />
				<MarkButton type='underline' />
				{!isMobile ? (
					<HighlightPopover />
				) : (
					<HighlighterButton onClick={onHighlighterClick} />
				)}
				{!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type='superscript' />
				<MarkButton type='subscript' />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<TextAlignButton align='left' />
				<TextAlignButton align='center' />
				<TextAlignButton align='right' />
				<TextAlignButton align='justify' />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<ImageUploadButton text='Add' />
			</ToolbarGroup>

			<Spacer />

			{isMobile && <ToolbarSeparator />}

			<ToolbarGroup>
				<ThemeToggle />
			</ToolbarGroup>
		</>
	);
};

const MobileToolbarContent = ({
	type,
	onBack,
}: {
	type: 'highlighter' | 'link';
	onBack: () => void;
}) => (
	<>
		<ToolbarGroup>
			<Button data-style='ghost' onClick={onBack}>
				<ArrowLeftIcon className='tiptap-button-icon' />
				{type === 'highlighter' ? (
					<HighlighterIcon className='tiptap-button-icon' />
				) : (
					<LinkIcon className='tiptap-button-icon' />
				)}
			</Button>
		</ToolbarGroup>

		<ToolbarSeparator />

		{type === 'highlighter' ? <HighlightContent /> : <LinkContent />}
	</>
);

interface Props {
	initialContent: Journal | null;
	user_id: string;
	currentDate: string;
}

export const SimpleEditor: React.FC<Props> = ({
	initialContent,
	user_id,
	currentDate,
}) => {
	const isMobile = useMobile();
	const windowSize = useWindowSize();
	const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>(
		'main'
	);

	const [currentJournal, setCurrentJournal] = useState<Journal | null>(
		initialContent
	);

	const currentId = useMemo(() => {
		return initialContent?.id || getRandomId();
	}, [initialContent]);

	const [rect, setRect] = useState<
		Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>
	>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});
	const toolbarRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [active, setActive] = useState<string | null>(null);

	const { append, messages } = useChat({
		api: '/api/action',
		maxSteps: 2,
	});

	useEffect(() => {
		const updateRect = () => {
			setRect(document.body.getBoundingClientRect());
		};

		updateRect();

		const resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(document.body);

		window.addEventListener('scroll', updateRect);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('scroll', updateRect);
		};
	}, []);

	const saveJournal = async (content: Content) => {
		try {
			// Only save if we have actual content or if we're updating an existing journal
			if (
				(!content || Object.keys(content).length === 0) &&
				!currentJournal?.id
			) {
				return;
			}

			const journal: Journal = {
				id: currentId,
				title: currentJournal?.title || '',
				created_at: currentJournal?.created_at || getTodaysDate(),
				updated_at: getTodaysDate(),
				user_id,
				content,
				date: currentDate,
			};

			setCurrentJournal(journal);
			await upsert_journal(journal);
		} catch (error) {
			console.error(error);
		}
	};

	const editor = useEditor({
		immediatelyRender: false,
		editorProps: {
			attributes: {
				autocomplete: 'off',
				autocorrect: 'off',
				autocapitalize: 'off',
				'aria-label': 'Main content area, start typing to enter text.',
				placeholder: 'Start typing to enter text.',
			},
		},
		extensions: [
			StarterKit,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			Underline,
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image,
			Typography,
			Superscript,
			Subscript,

			Selection,
			CommentMark,
			ImageUploadNode.configure({
				accept: 'image/*',
				maxSize: MAX_FILE_SIZE,
				limit: 3,
				upload: handleImageUpload,
				onError: (error) => console.error('Upload failed:', error),
			}),
			TrailingNode,
			Link.configure({ openOnClick: false }),
		],
		content: initialContent?.content || {},
		onUpdate: ({ editor }) => {
			const content = editor.getJSON();
			if ((content && Object.keys(content).length > 0) || currentJournal?.id) {
				const debounceTimer = setTimeout(() => {
					saveJournal(content);
					console.log('time to append');
					append({
						role: 'user',
						content: JSON.stringify(content),
					});
				}, 5000);

				return () => clearTimeout(debounceTimer);
			}
		},
	});

	useEffect(() => {
		const checkCursorVisibility = () => {
			if (!editor || !toolbarRef.current) return;

			const { state, view } = editor;
			if (!view.hasFocus()) return;

			const { from } = state.selection;
			const cursorCoords = view.coordsAtPos(from);

			if (windowSize.height < rect.height) {
				if (cursorCoords && toolbarRef.current) {
					const toolbarHeight =
						toolbarRef.current.getBoundingClientRect().height;
					const isEnoughSpace =
						windowSize.height - cursorCoords.top - toolbarHeight > 0;

					// If not enough space, scroll until the cursor is the middle of the screen
					if (!isEnoughSpace) {
						const scrollY =
							cursorCoords.top - windowSize.height / 2 + toolbarHeight;
						window.scrollTo({
							top: scrollY,
							behavior: 'smooth',
						});
					}
				}
			}
		};

		checkCursorVisibility();
	}, [editor, rect.height, windowSize.height]);

	useEffect(() => {
		if (!isMobile && mobileView !== 'main') {
			setMobileView('main');
		}
	}, [isMobile, mobileView]);

	const pos = useAnchors(editor, scrollRef as React.RefObject<HTMLDivElement>);

	return (
		<EditorContext.Provider value={{ editor }}>
			<Toolbar
				ref={toolbarRef}
				style={
					isMobile
						? {
								bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
						  }
						: {}
				}
			>
				{mobileView === 'main' ? (
					<MainToolbarContent
						onHighlighterClick={() => setMobileView('highlighter')}
						onLinkClick={() => setMobileView('link')}
						isMobile={isMobile}
					/>
				) : (
					<MobileToolbarContent
						type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
						onBack={() => setMobileView('main')}
					/>
				)}
			</Toolbar>
			{messages.map((message, index) => (
				<div key={index}>{message.content}</div>
			))}
			<div
				ref={scrollRef}
				className='content-wrapper px-20 relative flex justify-center gap-4 max-h-[90vh]'
			>
				<div className='w-full simple-editor-content'>
					<div className='px-12 flex flex-col gap-2 pt-12 pb-6'>
						<div>
							<p className='text-3xl font-bold'>May 3, 2025</p>
							<p className='text-sm text-muted-foreground'>10:00 AM | 5°</p>
						</div>
						<div className='border-b border-border w-full'></div>
					</div>
					<EditorContent
						editor={editor}
						role='presentation'
						className='w-full'
					/>
				</div>
				<div className='relative w-[260px] shrink-0'>
					<div className='flex flex-col gap-2 pt-12 pb-6'>
						<p className='text-muted-foreground h-[56px] flex items-end'>
							Actions
						</p>
						<div className='border-b border-border w-full'></div>
					</div>
					{sampleComments.map((c) => (
						<div
							key={c.id}
							onMouseEnter={() => setActive(c.id)}
							onMouseLeave={() => setActive(null)}
							className={`absolute transition-colors w-60 p-3 rounded-md shadow
                bg-background 
                border border-border`}
							style={{ top: pos[c.id] ?? 0, left: 0 }}
						>
							{c.text}
						</div>
					))}
				</div>
			</div>
		</EditorContext.Provider>
	);
};

export default SimpleEditor;
