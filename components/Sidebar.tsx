'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Project } from '@/types/project';

interface SidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  editingProjectId: string | null;
  editingProjectName: string;
  setEditingProjectName: (name: string) => void;
  createNewProject: () => void;
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  startEditingProject: (projectId: string, currentName: string) => void;
  saveProjectName: (projectId: string) => void;
  cancelEditingProject: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  projects,
  currentProjectId,
  editingProjectId,
  editingProjectName,
  setEditingProjectName,
  createNewProject,
  switchProject,
  deleteProject,
  startEditingProject,
  saveProjectName,
  cancelEditingProject,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // 모바일에서 프로젝트 선택 시 사이드바 닫기
  const handleProjectSwitch = (projectId: string) => {
    switchProject(projectId);
    onMobileClose?.();
  };

  // 프로젝트 리스트 렌더링 (공통)
  const renderProjectList = (onProjectClick: (id: string) => void) => (
    <div className="flex-1 overflow-y-auto px-2 pb-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-faint)] px-2 py-2">
        프로젝트
      </div>
      
      {projects.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-[var(--ink-muted)]">
          프로젝트가 없습니다
        </div>
      ) : (
        <div className="space-y-0.5">
          {projects.map((project) => {
            const isActive = currentProjectId === project.id;
            const isEditing = editingProjectId === project.id;
            const isHovered = hoveredProjectId === project.id;

            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                className={`group relative rounded transition-colors ${
                  isActive ? 'bg-[var(--stone)]' : 'hover:bg-[var(--stone)]'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1 p-1.5">
                    <input
                      type="text"
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveProjectName(project.id);
                        else if (e.key === 'Escape') cancelEditingProject();
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 text-xs rounded border border-[var(--stone-dark)] bg-[var(--paper)] outline-none focus:border-[var(--ink-muted)]"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={() => saveProjectName(project.id)}
                      className="p-1 rounded hover:bg-[var(--paper)] text-[var(--ink-muted)]"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={cancelEditingProject}
                      className="p-1 rounded hover:bg-[var(--paper)] text-[var(--ink-muted)]"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onProjectClick(project.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div 
                        className={`text-sm truncate ${isActive ? 'font-medium text-[var(--ink)]' : 'text-[var(--ink-light)]'}`}
                        title={project.name}
                      >
                        {project.name}
                      </div>
                      <div className="text-[10px] text-[var(--ink-faint)] mt-0.5">
                        {new Date(project.updatedAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {(isHovered || isActive) && (
                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingProject(project.id, project.name);
                          }}
                          className="p-1 rounded hover:bg-[var(--paper)] text-[var(--ink-faint)] hover:text-[var(--ink-muted)]"
                          title="이름 변경"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="p-1 rounded hover:bg-[var(--paper)] text-[var(--ink-faint)] hover:text-[var(--accent)]"
                          title="삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 접힌 사이드바 - 완성도 높은 '사이드 레일' 버전
  if (isCollapsed) {
    return (
      <div className="hidden md:flex w-16 min-h-screen bg-[var(--paper-warm)] border-r border-[var(--stone)] flex-col items-center py-6 print:hidden sticky top-0">
        {/* Top Section */}
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-10 rounded-xl bg-[var(--ink)] flex items-center justify-center text-white hover:bg-[var(--ink-light)] transition-all shadow-sm"
            title="사이드바 열기"
          >
            <BookOpen size={20} />
          </button>
          
          <button
            onClick={createNewProject}
            className="w-10 h-10 rounded-xl border border-[var(--stone-dark)] flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--stone)] hover:text-[var(--ink)] transition-all"
            title="새 프로젝트"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Middle Rail Line */}
        <div className="flex-1 w-px bg-gradient-to-b from-[var(--stone-dark)] via-[var(--stone-dark)] to-transparent my-6" />

        {/* Bottom Spacer (의도적으로 비워둠: 샘플처럼 최소 버튼만) */}
        <div className="h-6" />
      </div>
    );
  }

  // 모바일 오버레이
  const mobileOverlay = (
    <>
      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--paper-warm)] border-r border-[var(--stone)] flex-col z-50 transform transition-transform duration-300 ease-out md:hidden print:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--stone)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--ink)] rounded flex items-center justify-center">
              <BookOpen className="text-white" size={14} />
            </div>
            <span className="text-sm font-semibold text-[var(--ink)]">Book Smith</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded hover:bg-[var(--stone)] text-[var(--ink-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Project Button */}
        <div className="p-3">
          <button
            onClick={() => {
              createNewProject();
              onMobileClose?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium border border-dashed border-[var(--stone-dark)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--stone)] transition-colors"
          >
            <Plus size={16} />
            새 프로젝트
          </button>
        </div>

        {/* Project List */}
        {renderProjectList(handleProjectSwitch)}
      </div>
    </>
  );

  // 데스크톱 사이드바
  return (
    <>
      {mobileOverlay}
      <div className="hidden md:flex w-64 min-h-screen bg-[var(--paper-warm)] border-r border-[var(--stone)] flex-col print:hidden sticky top-0">
      {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--stone)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--ink)] rounded flex items-center justify-center">
              <BookOpen className="text-white" size={14} />
            </div>
            <span className="text-sm font-semibold text-[var(--ink)]">Book Smith</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded hover:bg-[var(--stone)] text-[var(--ink-muted)] transition-colors"
            title="사이드바 접기"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Project Button */}
        <div className="p-3">
          <button
            onClick={createNewProject}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium border border-dashed border-[var(--stone-dark)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--stone)] transition-colors"
          >
            <Plus size={16} />
            새 프로젝트
          </button>
        </div>

        {/* Project List */}
        {renderProjectList(switchProject)}
      </div>
    </>
  );
}
