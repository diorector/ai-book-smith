'use client';

import React from 'react';
import { BookOpen, RefreshCw, ChevronDown, File, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import type { Theme } from '@/constants/themes';
import type { Project } from '@/types/project';

interface HeaderProps {
  theme: Theme;
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
    <header className={`py-2.5 px-5 flex items-center justify-between print:hidden transition-all duration-300 ${theme.appbar}`}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8C6B5D] to-[#6B4A3D] rounded-xl blur-md opacity-40"></div>
          <div className="relative bg-gradient-to-br from-[#8C6B5D] via-[#7A5A4C] to-[#6B4A3D] p-2 rounded-xl shadow-lg">
            <BookOpen className="text-white drop-shadow-sm" size={20} />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#8C6B5D] via-[#6B4A3D] to-[#4A3B32] bg-clip-text text-transparent">
            Book Smith
          </h1>
          <span className="text-[9px] font-medium tracking-wider uppercase text-[#8C6B5D]/60">
            Publisher × AI
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2.5">
        {/* Project Selector */}
        <div className="relative project-selector">
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 transition-all duration-200 ${theme.chip} hover:border-[#B8A88A]`}
          >
            <File size={13} className="text-[#8C6B5D]" />
            <span className="max-w-[120px] truncate text-[#4A3B32]">
              {currentProjectId && projects.find(p => p.id === currentProjectId)?.name || '프로젝트 선택'}
            </span>
            <ChevronDown size={11} className="opacity-60" />
          </button>
          {showProjectSelector && (
            <div className={`absolute top-full right-0 mt-2.5 w-80 z-50 overflow-hidden ${theme.card}`}>
              {/* New Project Button */}
              <div className="p-3 border-b border-[#D4C5A9]">
                <button
                  onClick={createNewProject}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${theme.button}`}
                >
                  <PlusCircle size={16} /> 새 프로젝트
                </button>
              </div>
              {/* Project List */}
              <div className="max-h-72 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="p-5 text-center text-sm text-[#8C6B5D]/60">
                    프로젝트가 없습니다
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-2.5 transition-colors duration-150 border-b border-[#D4C5A9]/50 last:border-b-0 ${
                        currentProjectId === project.id ? 'bg-[#8C6B5D]/10' : 'hover:bg-[#EBE5CE]'
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
                              className={`flex-1 px-3 py-1.5 text-sm rounded-lg outline-none transition-all border ${theme.border} ${theme.input} ${theme.text}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => switchProject(project.id)}
                              className="flex-1 text-left px-3 py-2 rounded-lg transition-colors hover:bg-[#EBE5CE]"
                            >
                              <div className="font-semibold text-sm text-[#4A3B32]">
                                {project.name}
                              </div>
                              <div className="text-xs mt-0.5 text-[#8C6B5D]/60">
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
                                className="p-1.5 rounded-lg transition-colors hover:bg-[#8C6B5D]/20 text-[#8C6B5D]"
                                title="이름 변경"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteProject(project.id)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-500"
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
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <RefreshCw size={12} /> 초기화
        </button>
      </div>
    </header>
  );
}
