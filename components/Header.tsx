'use client';

import React from 'react';
import { BookOpen, RefreshCw, Palette, ChevronDown, File, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { THEMES, type ThemeKey, type Theme } from '@/constants/themes';
import type { Project } from '@/types/project';

interface HeaderProps {
  theme: Theme;
  currentTheme: ThemeKey;
  setCurrentTheme: (theme: ThemeKey) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  projects: Project[];
  currentProjectId: string | null;
  showProjectSelector: boolean;
  setShowProjectSelector: (show: boolean) => void;
  editingProjectId: string | null;
  editingProjectName: string;
  setEditingProjectName: (name: string) => void;
  createNewProject: () => void;
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  startEditingProject: (projectId: string, currentName: string) => void;
  saveProjectName: (projectId: string) => void;
  cancelEditingProject: () => void;
  handleReset: () => void;
}

export default function Header({
  theme,
  currentTheme,
  setCurrentTheme,
  showThemeSelector,
  setShowThemeSelector,
  projects,
  currentProjectId,
  showProjectSelector,
  setShowProjectSelector,
  editingProjectId,
  editingProjectName,
  setEditingProjectName,
  createNewProject,
  switchProject,
  deleteProject,
  startEditingProject,
  saveProjectName,
  cancelEditingProject,
  handleReset,
}: HeaderProps) {
  return (
    <header className={`ui-appbar py-2 px-4 flex items-center justify-between print:hidden ${theme.panel}`}>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur-sm opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-1.5 rounded-lg">
            <BookOpen className="text-white" size={18} />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">
            Book Smith
          </h1>
          <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">Publisher × AI</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Project Selector */}
        <div className="relative project-selector">
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="ui-chip ui-focus flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 hover:bg-black/5"
          >
            <File size={12} />
            {currentProjectId && projects.find(p => p.id === currentProjectId)?.name || '프로젝트 선택'}
            <ChevronDown size={10} />
          </button>
          {showProjectSelector && (
            <div className={`absolute top-full right-0 mt-2 w-72 ui-card z-50 ${theme.panel}`}>
              <div className={`p-2 border-b ${theme.border}`}>
                <button
                  onClick={createNewProject}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ui-focus ${theme.button} hover:opacity-90`}
                >
                  <PlusCircle size={16} /> 새 프로젝트
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="p-4 text-center text-sm opacity-60">프로젝트가 없습니다</div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-2 border-b last:border-b-0 ${theme.border} ${currentProjectId === project.id ? 'bg-indigo-500/10' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {editingProjectId === project.id ? (
                          <div className="flex-1 flex items-center gap-1">
                            <input
                              type="text"
                              value={editingProjectName}
                              onChange={(e) => setEditingProjectName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveProjectName(project.id);
                                } else if (e.key === 'Escape') {
                                  cancelEditingProject();
                                }
                              }}
                              onBlur={() => saveProjectName(project.id)}
                              autoFocus
                              className={`flex-1 px-2 py-1 text-sm rounded border ${theme.border} ${theme.input} ${theme.text} outline-none`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => switchProject(project.id)}
                              className="flex-1 text-left px-2 py-1 rounded hover:bg-black/5"
                            >
                              <div className="font-semibold text-sm">{project.name}</div>
                              <div className="text-xs opacity-60">
                                {new Date(project.updatedAt).toLocaleDateString('ko-KR', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingProject(project.id, project.name);
                                }}
                                className="p-1 rounded hover:bg-indigo-500/20 text-indigo-500"
                                title="이름 변경"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteProject(project.id)}
                                className="p-1 rounded hover:bg-red-500/20 text-red-500"
                                title="삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
        >
          <RefreshCw size={12} /> 프로젝트 초기화
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${theme.text}`}
            title="Change Theme"
          >
            <Palette size={16} />
          </button>
          {showThemeSelector && (
            <div className={`absolute right-0 top-10 w-40 rounded-lg shadow-xl border overflow-hidden z-30 ${theme.panel} ${theme.border}`}>
              {(Object.keys(THEMES) as Array<ThemeKey>).map(k => (
                <button 
                  key={k} 
                  onClick={() => { setCurrentTheme(k); setShowThemeSelector(false); }} 
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-black/10 flex items-center gap-2 ${theme.text}`}
                >
                  <div className={`w-3 h-3 rounded-full ${THEMES[k].bg} border border-slate-400`}></div>
                  {THEMES[k].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

