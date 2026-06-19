import React from 'react';
import { 
  ArrowLeft, 
  Download, 
  Undo2, 
  Redo2, 
  Settings, 
  ZoomIn, 
  ZoomOut,
  PanelLeftClose,
  PanelLeft,
  Layout,
  Plus,
  ArrowUpDown,
  Palette
} from 'lucide-react';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (val: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomScale: number;
  setZoomScale: (val: number) => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  onDownload: () => void;
  onBack: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  
  // Modal Triggers
  isResume?: boolean;
  onOpenTemplates?: () => void;
  onOpenAddSection?: () => void;
  onOpenRearrange?: () => void;
  onOpenDesign?: () => void;
  designPanelActive?: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomScale,
  setZoomScale,
  showSettings,
  setShowSettings,
  onDownload,
  onBack,
  sidebarOpen,
  onToggleSidebar,
  
  isResume,
  onOpenTemplates,
  onOpenAddSection,
  onOpenRearrange,
  onOpenDesign,
  designPanelActive,
}) => {
  return (
    <header className="bg-sidebar border-b border-border-color/60 px-6 py-3.5 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-card border border-transparent hover:border-border-color rounded-lg transition text-text-muted hover:text-brand-accent cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSidebar}
          className={`p-1.5 hover:bg-card border rounded-lg transition text-text-muted hover:text-brand-accent cursor-pointer ${
            sidebarOpen ? 'border-border-color/40 bg-card' : 'border-transparent'
          }`}
          title={sidebarOpen ? "Hide Sidebar Form" : "Show Sidebar Form"}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent border border-transparent hover:border-border-color/30 focus:border-brand-accent/50 focus:bg-input-bg rounded px-2 py-1 text-sm font-bold text-text-main focus:outline-none w-56 truncate"
        />

        {/* Auto-Save dot status */}
        <span className="text-[10px] text-text-muted italic flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            saveStatus === 'saved' ? 'bg-green-500' : saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
          }`} />
          {saveStatus === 'saving' ? 'Saving changes...' : saveStatus === 'saved' ? 'All changes saved' : 'Idle'}
        </span>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-3">
        {/* Document Modals (Resume specific) */}
        {isResume && (
          <div className="flex items-center border border-border-color/50 rounded-lg p-0.5 bg-input-bg">
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-brand-accent hover:bg-card rounded-md transition text-xs font-semibold cursor-pointer"
              title="Change Template Layout"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>
            <button
              onClick={onOpenAddSection}
              className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-brand-accent hover:bg-card rounded-md transition text-xs font-semibold cursor-pointer"
              title="Add a new Section"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
            <button
              onClick={onOpenRearrange}
              className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-brand-accent hover:bg-card rounded-md transition text-xs font-semibold cursor-pointer"
              title="Rearrange Sections"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Rearrange</span>
            </button>
            <button
              onClick={onOpenDesign}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition text-xs font-semibold cursor-pointer ${
                designPanelActive
                  ? 'bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/30'
                  : 'text-text-muted hover:text-brand-accent hover:bg-card'
              }`}
              title="Page Design Settings"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>
          </div>
        )}

        {/* History stack traversal (Undo/Redo) */}
        <div className="flex items-center border border-border-color/50 rounded-lg p-0.5 bg-input-bg">
          <button
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 text-text-muted hover:text-brand-accent disabled:opacity-30 transition cursor-pointer"
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 text-text-muted hover:text-brand-accent disabled:opacity-30 transition cursor-pointer"
            title="Redo (Cmd+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Visual scaling (Zoom) */}
        <div className="flex items-center gap-1.5 border border-border-color/50 rounded-lg px-2 py-1 bg-input-bg text-xs">
          <button 
            onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.05))} 
            className="hover:text-brand-accent transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono">{Math.round(zoomScale * 100)}%</span>
          <button 
            onClick={() => setZoomScale(Math.min(1.5, zoomScale + 0.05))} 
            className="hover:text-brand-accent transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Key settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 border rounded-lg transition cursor-pointer ${
            showSettings ? 'bg-brand-accent/25 border-brand-accent text-brand-accent' : 'border-border-color/60 hover:bg-card text-text-muted'
          }`}
          title="AI Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Direct PDF Download */}
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-semibold rounded-lg shadow-lg hover:shadow-brand-accent/10 transition text-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>
    </header>
  );
};
