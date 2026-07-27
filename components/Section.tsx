import React, { useState, useId, useRef, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PencilIcon } from './icons/PencilIcon';
import { useTranslation } from '../i18n';

interface Item {
  id: string;
  [key: string]: any;
}

interface SectionProps<T extends Item> {
  title: string;
  items?: T[];
  setItems?: (items: T[]) => void;
  newItem?: Omit<T, 'id'>;
  renderItem?: (item: T, onChange: (key: keyof T, value: any) => void, index: number) => React.ReactNode;
  children?: React.ReactNode;
  isDraggable?: boolean;
  isCollapsible?: boolean;
  isEditable?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
  headerAddon?: React.ReactNode;
  isHighlighted?: boolean;
}

const Section = <T extends Item,>({
  title,
  items,
  setItems,
  newItem,
  renderItem,
  children,
  isDraggable = false,
  isCollapsible = false,
  isEditable = false,
  isOpen = false,
  onToggle,
  onDelete,
  onRename,
  headerAddon,
  isHighlighted = false,
}: SectionProps<T>) => {
  const contentId = useId();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useTranslation();
  
  useEffect(() => {
    if (!isEditingTitle) {
      setEditedTitle(title);
    }
  }, [title, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const addItem = () => {
    if (setItems && newItem) {
      if (!isOpen && onToggle) {
        onToggle();
      }
      setItems([...(items || []), { ...newItem, id: crypto.randomUUID() } as T]);
    }
  };

  const removeItem = (id: string) => {
    if (setItems) {
      setItems((items || []).filter(item => item.id !== id));
    }
  };
  
  const handleItemChange = (id: string, key: keyof T, value: any) => {
    if (setItems) {
        setItems((items || []).map(item => item.id === id ? { ...item, [key]: value } : item));
    }
  };
  
  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only update the local state on each keystroke to avoid re-rendering the parent.
      // This prevents the input from losing focus.
      setEditedTitle(e.target.value);
  };

  const commitRename = () => {
      if (onRename) {
          const newTitle = editedTitle.trim();
          if (newTitle && newTitle !== title) {
              onRename(newTitle);
          } else {
              // If the title is empty or unchanged, revert the local state to the original prop title.
              setEditedTitle(title);
          }
      }
      setIsEditingTitle(false);
  };

  const handleTitleBlur = () => {
      commitRename();
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          commitRename(); // Commit changes on Enter
      }
      if (e.key === 'Escape') {
          e.preventDefault();
          setEditedTitle(title); // Revert changes on Escape
          setIsEditingTitle(false);
      }
  };

  const startEditing = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditedTitle(title); // Ensure we start editing with the latest title
      setIsEditingTitle(true);
  }

  const HeaderContent = () => (
    <>
      {isDraggable && <span className={isCollapsible ? "" : "cursor-grab"}><DragHandleIcon /></span>}
      <div className="flex-grow text-start mx-2">
        {isEditingTitle && onRename ? (
            <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={handleTitleInputChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className={`w-full text-lg font-semibold bg-secondary rounded-md p-0.5 -m-0.5 focus:ring-2 focus:ring-ring focus:outline-none`}
            />
        ) : (
            <span>{title}</span>
        )}
      </div>
      {headerAddon && <div className="ms-auto ps-2">{headerAddon}</div>}
      <div className="flex items-center space-x-1 ps-2 opacity-100 transition-opacity duration-200 rtl:space-x-reverse sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          {isEditable && onRename && (
              <button
                  type="button"
                  onClick={startEditing}
                  className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground"
                  aria-label={t('section.renameSection')}
                  title={t('section.renameSection')}
              >
                  <PencilIcon />
              </button>
          )}
          {isEditable && onDelete && (
              <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-destructive/10"
                  aria-label={t('section.deleteSection')}
                  title={t('section.deleteSection')}
              >
                  <TrashIcon />
              </button>
          )}
      </div>
      {isCollapsible && <ChevronDownIcon className={`ms-2 transition-transform duration-300 ${!isOpen ? '-rotate-90 rtl:rotate-90' : 'rotate-0'}`} />}
    </>
  );

  return (
    <div className={`bg-card rounded-xl shadow-sm border group transition-all ${isHighlighted ? 'border-[#00B5A5] ring-2 ring-[#00B5A5]/20' : 'border-border'}`}>
      {isCollapsible ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (onToggle) onToggle();
            }
          }}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className={`w-full flex items-center text-lg font-semibold text-foreground p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${isOpen ? 'border-b border-border' : ''}`}
        >
          <HeaderContent />
        </div>
      ) : (
        <h3 className={`flex items-center text-lg font-semibold text-foreground p-4 border-b border-border ${isDraggable ? 'cursor-grab' : ''}`}>
          <HeaderContent />
        </h3>
      )}
      
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            {children}
            {(!React.isValidElement(children) || (children.type as any).name !== 'Section') && (
              <div className="space-y-4">
                {items && renderItem && items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-secondary/50 rounded-md border border-border/70 relative group/item">
                    <div className="absolute top-1 end-1">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={language === 'ar' ? 'حذف العنصر' : 'Delete item'}
                          title={language === 'ar' ? 'حذف العنصر' : 'Delete item'}
                          className="rounded-full p-1 text-destructive opacity-100 transition-opacity hover:bg-destructive/10 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus:opacity-100"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                    {renderItem(item, (key, value) => handleItemChange(item.id, key, value), index)}
                  </div>
                ))}

                {items && items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                      {t('section.noItems')}
                  </p>
                )}

                {setItems && newItem && (
                  <button type="button" onClick={addItem} className="mt-2 flex w-full items-center justify-center rounded-md bg-blue-500/10 p-2 text-sm text-blue-600 transition-colors hover:bg-blue-500/20 dark:text-blue-400">
                    <PlusIcon /> <span className="mx-2">{t('section.addNew')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section;
