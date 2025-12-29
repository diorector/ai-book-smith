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
  // Study 테마 여부 확인
  const isStudyTheme = currentTheme === 'study';

  return (
    <header className={`py-2.5 px-5 flex items-center justify-between print:hidden transition-all duration-300 ${
      isStudyTheme 
        ? 'crystal-appbar' 
        : `ui-appbar ${theme.panel}`
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {isStudyTheme ? (
            <>
              {/* Crystal Paperweight 로고 - 따뜻한 골드 톤 */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--antique-gold)] to-[var(--leather-brown)] rounded-xl blur-md opacity-40"></div>
              <div className="relative bg-gradient-to-br from-[var(--antique-gold)] via-[var(--antique-gold-dim)] to-[var(--leather-brown)] p-2 rounded-xl shadow-lg">
                <BookOpen className="text-white drop-shadow-sm" size={20} />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur-sm opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-1.5 rounded-lg">
                <BookOpen className="text-white" size={18} />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className={`text-lg font-extrabold tracking-tight ${
            isStudyTheme 
              ? 'bg-gradient-to-r from-[var(--antique-gold)] via-[var(--leather-brown)] to-[var(--burgundy)] bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent'
          }`}>
            Book Smith
          </h1>
          <span className={`text-[9px] font-medium tracking-wider uppercase ${
            isStudyTheme ? 'text-ink-muted' : 'text-slate-400'
          }`}>
            Publisher × AI
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2.5">
        {/* Project Selector */}
        <div className="relative project-selector">
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 transition-all duration-200 ${
              isStudyTheme 
                ? 'crystal-chip hover:border-[var(--glass-border-strong)]' 
                : 'ui-chip ui-focus hover:bg-black/5'
            }`}
          >
            <File size={13} className={isStudyTheme ? 'text-antique-gold' : ''} />
            <span className="max-w-[120px] truncate">
              {currentProjectId && projects.find(p => p.id === currentProjectId)?.name || '프로젝트 선택'}
            </span>
            <ChevronDown size={11} className="opacity-60" />
          </button>
          {showProjectSelector && (
            <div className={`absolute top-full right-0 mt-2.5 w-80 z-50 overflow-hidden ${
              isStudyTheme 
                ? 'crystal-card-lg' 
                : `ui-card ${theme.panel}`
            }`}>
              {/* New Project Button */}
              <div className={`p-3 ${isStudyTheme ? 'border-b border-[var(--glass-border)]' : `border-b ${theme.border}`}`}>
                <button
                  onClick={createNewProject}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isStudyTheme 
                      ? 'crystal-btn-primary' 
                      : `${theme.button} hover:opacity-90`
                  }`}
                >
                  <PlusCircle size={16} /> 새 프로젝트
                </button>
              </div>
              {/* Project List */}
              <div className="max-h-72 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className={`p-5 text-center text-sm ${isStudyTheme ? 'text-ink-muted' : 'opacity-60'}`}>
                    프로젝트가 없습니다
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-2.5 transition-colors duration-150 ${
                        isStudyTheme 
                          ? `border-b border-[var(--glass-border)] last:border-b-0 ${currentProjectId === project.id ? 'bg-[var(--antique-gold)]/10' : 'hover:bg-[var(--glass-warm)]'}`
                          : `border-b last:border-b-0 ${theme.border} ${currentProjectId === project.id ? 'bg-indigo-500/10' : ''}`
                      }`}
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
                              className={`flex-1 px-3 py-1.5 text-sm rounded-lg outline-none transition-all ${
                                isStudyTheme 
                                  ? 'crystal-input' 
                                  : `border ${theme.border} ${theme.input} ${theme.text}`
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => switchProject(project.id)}
                              className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                                isStudyTheme ? 'hover:bg-[var(--glass-warm)]' : 'hover:bg-black/5'
                              }`}
                            >
                              <div className={`font-semibold text-sm ${isStudyTheme ? 'text-ink-deep' : ''}`}>
                                {project.name}
                              </div>
                              <div className={`text-xs mt-0.5 ${isStudyTheme ? 'text-ink-muted' : 'opacity-60'}`}>
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
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isStudyTheme 
                                    ? 'hover:bg-[var(--antique-gold)]/20 text-antique-gold' 
                                    : 'hover:bg-indigo-500/20 text-indigo-500'
                                }`}
                                title="이름 변경"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteProject(project.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isStudyTheme 
                                    ? 'hover:bg-[var(--burgundy)]/20 text-burgundy' 
                                    : 'hover:bg-red-500/20 text-red-500'
                                }`}
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
        
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
            isStudyTheme 
              ? 'border-[var(--burgundy-soft)] text-burgundy hover:bg-[var(--burgundy)]/10' 
              : 'border-red-200 text-red-500 hover:bg-red-50'
          }`}
        >
          <RefreshCw size={12} /> 초기화
        </button>
        
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isStudyTheme 
                ? 'hover:bg-[var(--glass-warm)] text-ink-medium' 
                : `hover:bg-black/10 ${theme.text}`
            }`}
            title="테마 변경"
          >
            <Palette size={17} />
          </button>
          {showThemeSelector && (
            <div className={`absolute right-0 top-12 w-44 overflow-hidden z-30 ${
              isStudyTheme 
                ? 'crystal-card' 
                : `rounded-lg shadow-xl border ${theme.panel} ${theme.border}`
            }`}>
              {(Object.keys(THEMES) as Array<ThemeKey>).map(k => (
                <button 
                  key={k} 
                  onClick={() => { setCurrentTheme(k); setShowThemeSelector(false); }} 
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    isStudyTheme 
                      ? `hover:bg-[var(--glass-warm)] ${currentTheme === k ? 'bg-[var(--antique-gold)]/10 font-semibold' : ''} text-ink-medium` 
                      : `hover:bg-black/10 ${theme.text}`
                  }`}
                >
                  {/* Theme color indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    k === 'study' 
                      ? 'bg-gradient-to-br from-[#C4A456] to-[#8B6914] border-[#A68B3D]' 
                      : k === 'midnight'
                        ? 'bg-slate-800 border-indigo-400'
                        : k === 'paper'
                          ? 'bg-stone-100 border-orange-400'
                          : k === 'coffee'
                            ? 'bg-[#F5F1E8] border-[#8C6B5D]'
                            : 'bg-black border-cyan-400'
                  }`}></div>
                  <span>{THEMES[k].name}</span>
                  {currentTheme === k && (
                    <span className={`ml-auto text-xs ${isStudyTheme ? 'text-antique-gold' : 'text-indigo-500'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

