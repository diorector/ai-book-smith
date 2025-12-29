'use client';

import { useState, useEffect, useCallback } from 'react';
import { deleteProjectState, getProjectState, migrateLocalStorageProjectStateIfNeeded, setProjectState } from '@/lib/projectStorage';
import { PROJECTS_KEY } from '@/constants';
import { generateProjectId } from '@/utils/helpers';
import type { Project, ProjectState, Message, FeedbackChatMessage, Progress, AutoFactCheckProgress, CustomStyle } from '@/types/project';
import type { BookStructure } from '@/types/book';
import type { ToneSettings } from '@/constants/toneFactors';
import type { ThemeKey } from '@/constants/themes';
import type { FactCheckLog, FactClaim } from '@/types/factCheck';
import type { CoverConcepts } from '@/types/project';

interface UseProjectManagementReturn {
  // Project management
  projects: Project[];
  currentProjectId: string | null;
  showProjectSelector: boolean;
  editingProjectId: string | null;
  editingProjectName: string;
  setShowProjectSelector: (show: boolean) => void;
  createNewProject: () => void;
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  startEditingProject: (projectId: string, currentName: string) => void;
  saveProjectName: (projectId: string) => void;
  cancelEditingProject: () => void;
  setEditingProjectName: (name: string) => void;
  updateProjectName: (name: string) => void;
  
  // State
  step: string;
  setStep: (step: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  readyForOutline: boolean;
  setReadyForOutline: (ready: boolean) => void;
  hasConfirmedStyle: boolean;
  setHasConfirmedStyle: (confirmed: boolean) => void;
  toneSettings: ToneSettings;
  setToneSettings: (settings: ToneSettings) => void;
  customStyles: CustomStyle[];
  setCustomStyles: React.Dispatch<React.SetStateAction<CustomStyle[]>>;
  selectedCustomStyleId: string | null;
  setSelectedCustomStyleId: (id: string | null) => void;
  bookStructure: BookStructure | null;
  setBookStructure: (structure: BookStructure | null) => void;
  subsectionContents: Record<string, string>;
  setSubsectionContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  factClaimsBySection: Record<string, FactClaim[]>;
  setFactClaimsBySection: React.Dispatch<React.SetStateAction<Record<string, FactClaim[]>>>;
  factCheckMode: 'off' | 'fast' | 'web';
  setFactCheckMode: (mode: 'off' | 'fast' | 'web') => void;
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  coverImage: string | null;
  setCoverImage: (image: string | null) => void;
  coverConcepts: CoverConcepts | null;
  setCoverConcepts: (concepts: CoverConcepts | null) => void;
  coverPromptUsed: string;
  setCoverPromptUsed: (prompt: string) => void;
  currentTheme: ThemeKey;
  setCurrentTheme: (theme: ThemeKey) => void;
  includeIntroOutro: boolean;
  setIncludeIntroOutro: (include: boolean) => void;
  isTestMode: boolean;
  setIsTestMode: (testMode: boolean) => void;
  writingFeedback: string;
  setWritingFeedback: (feedback: string) => void;
  showFeedbackInput: boolean;
  setShowFeedbackInput: (show: boolean) => void;
  feedbackChatMessages: FeedbackChatMessage[];
  setFeedbackChatMessages: React.Dispatch<React.SetStateAction<FeedbackChatMessage[]>>;
  showDetailedToc: boolean;
  setShowDetailedToc: (show: boolean) => void;
  tocExpandedChapters: Record<number, boolean>;
  setTocExpandedChapters: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  autoFactCheckProgress: AutoFactCheckProgress;
  setAutoFactCheckProgress: React.Dispatch<React.SetStateAction<AutoFactCheckProgress>>;
  factCheckLogs: Record<string, FactCheckLog>;
  setFactCheckLogs: React.Dispatch<React.SetStateAction<Record<string, FactCheckLog>>>;
  showRecoveryBanner: boolean;
  setShowRecoveryBanner: (show: boolean) => void;
  
  // Actions
  handleReset: () => void;
  saveProjectState: () => Promise<void>;
}

const defaultFeedbackMessage: FeedbackChatMessage = {
  role: 'assistant',
  content: '샘플 원고를 보고 느낀 점을 알려주세요. (문체/구성/깊이/예시/독자 난이도 등)'
};

export function useProjectManagement(): UseProjectManagementReturn {
  // Project management state
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');

  // App state
  const [step, setStep] = useState('interview');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "안녕하세요! 어떤 책을 쓰고 싶으신가요? 책의 주제나 키워드를 알려주세요." }
  ]);
  const [readyForOutline, setReadyForOutline] = useState(false);
  const [hasConfirmedStyle, setHasConfirmedStyle] = useState(false);
  const [toneSettings, setToneSettings] = useState<ToneSettings>({
    role: 'mentor',
    tone: 'warm',
    style: 'concise',
    authorPreset: 'none',
    difficulty: 3
  });
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);
  const [selectedCustomStyleId, setSelectedCustomStyleId] = useState<string | null>(null);
  const [bookStructure, setBookStructure] = useState<BookStructure | null>(null);
  const [subsectionContents, setSubsectionContents] = useState<Record<string, string>>({});
  const [factClaimsBySection, setFactClaimsBySection] = useState<Record<string, FactClaim[]>>({});
  const [factCheckMode, setFactCheckMode] = useState<'off' | 'fast' | 'web'>('web');
  const [progress, setProgress] = useState<Progress>({ total: 0, current: 0, status: 'idle' });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverConcepts, setCoverConcepts] = useState<CoverConcepts | null>(null);
  const [coverPromptUsed, setCoverPromptUsed] = useState('');
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('coffee');
  const [includeIntroOutro, setIncludeIntroOutro] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);
  const [writingFeedback, setWritingFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackChatMessages, setFeedbackChatMessages] = useState<FeedbackChatMessage[]>([defaultFeedbackMessage]);
  const [showDetailedToc, setShowDetailedToc] = useState(false);
  const [tocExpandedChapters, setTocExpandedChapters] = useState<Record<number, boolean>>({});
  const [autoFactCheckProgress, setAutoFactCheckProgress] = useState<AutoFactCheckProgress>({ current: 0, total: 0, status: '' });
  const [factCheckLogs, setFactCheckLogs] = useState<Record<string, FactCheckLog>>({});
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Load projects list (initialization)
  useEffect(() => {
    const savedProjects = localStorage.getItem(PROJECTS_KEY);
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (parsed.length > 0) {
          setProjects(parsed);
          const lastProjectId = localStorage.getItem('ai-book-smith-last-project');
          const projectId = lastProjectId && parsed.find((p: Project) => p.id === lastProjectId) 
            ? lastProjectId 
            : parsed[0].id;
          setCurrentProjectId(projectId);
        } else {
          createInitialProject();
        }
      } catch {
        createInitialProject();
      }
    } else {
      createInitialProject();
    }
  }, []);

  function createInitialProject() {
    const newId = generateProjectId();
    const newProject: Project = {
      id: newId,
      name: '새 프로젝트',
      updatedAt: Date.now()
    };
    setProjects([newProject]);
    setCurrentProjectId(newId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([newProject]));
    localStorage.setItem('ai-book-smith-last-project', newId);
  }

  // Close project selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProjectSelector && !target.closest('.project-selector')) {
        setShowProjectSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectSelector]);

  // Load project state
  useEffect(() => {
    if (!currentProjectId) return;

    let cancelled = false;
    (async () => {
      try {
        await migrateLocalStorageProjectStateIfNeeded(currentProjectId);
        const parsed = await getProjectState(currentProjectId);
        if (!parsed || cancelled) return;

        if (parsed.step) setStep(parsed.step);
        if (parsed.messages) setMessages(parsed.messages);
        if (typeof parsed.readyForOutline === 'boolean') setReadyForOutline(parsed.readyForOutline);
        if (typeof parsed.hasConfirmedStyle === 'boolean') setHasConfirmedStyle(parsed.hasConfirmedStyle);
        if (parsed.toneSettings) setToneSettings(parsed.toneSettings);
        if (parsed.bookStructure) setBookStructure(parsed.bookStructure);
        if (parsed.subsectionContents) setSubsectionContents(parsed.subsectionContents);
        if (parsed.factClaimsBySection) setFactClaimsBySection(parsed.factClaimsBySection);
        setFactCheckMode('web');
        if (parsed.progress) {
          if (parsed.step === 'writing' && parsed.progress?.status === 'writing') {
            setProgress({ ...parsed.progress, status: 'stopped' });
            setShowRecoveryBanner(true);
          } else {
            setProgress(parsed.progress);
            setShowRecoveryBanner(false);
          }
        }
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
        if (parsed.coverConcepts) setCoverConcepts(parsed.coverConcepts);
        if (parsed.coverPromptUsed) setCoverPromptUsed(parsed.coverPromptUsed);
        if (parsed.currentTheme) setCurrentTheme(parsed.currentTheme);
        if (parsed.includeIntroOutro !== undefined) setIncludeIntroOutro(parsed.includeIntroOutro);
        if (parsed.isTestMode !== undefined) setIsTestMode(parsed.isTestMode);
        if (parsed.writingFeedback) setWritingFeedback(parsed.writingFeedback);
        if (parsed.showFeedbackInput !== undefined) setShowFeedbackInput(parsed.showFeedbackInput);
        if (parsed.feedbackChatMessages) setFeedbackChatMessages(parsed.feedbackChatMessages);
        if (parsed.autoFactCheckProgress) setAutoFactCheckProgress(parsed.autoFactCheckProgress);
        if (parsed.factCheckLogs) setFactCheckLogs(parsed.factCheckLogs);
        if (typeof parsed.showDetailedToc === 'boolean') setShowDetailedToc(parsed.showDetailedToc);
        if (parsed.tocExpandedChapters && typeof parsed.tocExpandedChapters === 'object') {
          setTocExpandedChapters(parsed.tocExpandedChapters);
        }
      } catch (e) {
        console.error("Failed to load project state (IndexedDB):", e);
      }
    })();

    return () => { cancelled = true; };
  }, [currentProjectId]);

  // Save state
  const saveProjectState = useCallback(async () => {
    if (!currentProjectId) return;

    const stateToSave: ProjectState = {
      step,
      messages,
      readyForOutline,
      hasConfirmedStyle,
      toneSettings,
      bookStructure,
      subsectionContents,
      factClaimsBySection,
      factCheckMode,
      progress,
      coverImage,
      coverConcepts,
      coverPromptUsed,
      currentTheme,
      includeIntroOutro,
      isTestMode,
      writingFeedback,
      showFeedbackInput,
      feedbackChatMessages,
      showDetailedToc,
      tocExpandedChapters,
      autoFactCheckProgress,
      factCheckLogs,
    };

    try {
      await setProjectState(currentProjectId, stateToSave);
    } catch (e) {
      console.error("Failed to save project state (IndexedDB):", e);
    }

    // Update project metadata
    const updatedProjects = projects.map(p => 
      p.id === currentProjectId 
        ? { ...p, updatedAt: Date.now(), name: bookStructure?.title || p.name || '제목 없음' }
        : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    localStorage.setItem('ai-book-smith-last-project', currentProjectId);
  }, [
    currentProjectId, step, messages, readyForOutline, hasConfirmedStyle, toneSettings, bookStructure,
    subsectionContents, factClaimsBySection, factCheckMode, progress, coverImage,
    coverConcepts, coverPromptUsed, currentTheme, includeIntroOutro, isTestMode,
    writingFeedback, showFeedbackInput, feedbackChatMessages, showDetailedToc,
    tocExpandedChapters, autoFactCheckProgress, factCheckLogs, projects
  ]);

  // Auto-save effect
  useEffect(() => {
    if (!currentProjectId) return;
    const t = setTimeout(() => {
      saveProjectState();
    }, 600);
    return () => clearTimeout(t);
  }, [
    step, messages, readyForOutline, toneSettings, bookStructure, subsectionContents,
    factClaimsBySection, factCheckMode, progress, coverImage, coverConcepts,
    coverPromptUsed, currentTheme, includeIntroOutro, isTestMode, writingFeedback,
    showFeedbackInput, feedbackChatMessages, showDetailedToc, tocExpandedChapters
  ]);

  const createNewProject = useCallback(() => {
    const newId = generateProjectId();
    const newProject: Project = {
      id: newId,
      name: '새 프로젝트',
      updatedAt: Date.now()
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setCurrentProjectId(newId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    localStorage.setItem('ai-book-smith-last-project', newId);
    
    // Reset state
    resetState();
    setShowProjectSelector(false);
  }, [projects]);

  const switchProject = useCallback((projectId: string) => {
    // 먼저 상태를 초기화하고 프로젝트 전환
    // (useEffect에서 새 프로젝트 데이터를 로드할 때까지 이전 데이터가 보이는 것을 방지)
    setStep('interview');
    setMessages([{ role: 'assistant', content: "안녕하세요! 어떤 책을 쓰고 싶으신가요? 책의 주제나 키워드를 알려주세요." }]);
    setReadyForOutline(false);
    setHasConfirmedStyle(false);
    setBookStructure(null);
    setSubsectionContents({});
    setFactClaimsBySection({});
    setProgress({ total: 0, current: 0, status: 'idle' });
    setCoverImage(null);
    setCoverConcepts(null);
    setCoverPromptUsed('');
    setShowRecoveryBanner(false);
    setAutoFactCheckProgress({ current: 0, total: 0, status: '' });
    setFactCheckLogs({});
    setTocExpandedChapters({});
    
    setCurrentProjectId(projectId);
    localStorage.setItem('ai-book-smith-last-project', projectId);
    setShowProjectSelector(false);
  }, []);

  const deleteProjectHandler = useCallback((projectId: string) => {
    if (!window.confirm('이 프로젝트를 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    deleteProjectState(projectId).catch(() => {});
    
    if (currentProjectId === projectId) {
      if (updatedProjects.length > 0) {
        switchProject(updatedProjects[0].id);
      } else {
        createNewProject();
      }
    }
  }, [projects, currentProjectId, switchProject, createNewProject]);

  const startEditingProject = useCallback((projectId: string, currentName: string) => {
    setEditingProjectId(projectId);
    setEditingProjectName(currentName);
  }, []);

  const saveProjectName = useCallback((projectId: string) => {
    if (!editingProjectName.trim()) {
      setEditingProjectId(null);
      return;
    }
    
    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, name: editingProjectName.trim().substring(0, 50), updatedAt: Date.now() }
        : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    setEditingProjectId(null);
    setEditingProjectName('');
  }, [projects, editingProjectName]);

  const cancelEditingProject = useCallback(() => {
    setEditingProjectId(null);
    setEditingProjectName('');
  }, []);

  const updateProjectName = useCallback((name: string) => {
    if (!currentProjectId) return;
    const updatedProjects = projects.map(p => 
      p.id === currentProjectId 
        ? { ...p, name: name.substring(0, 50), updatedAt: Date.now() }
        : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  }, [currentProjectId, projects]);

  function resetState() {
    setStep('interview');
    setMessages([{ role: 'assistant', content: "안녕하세요! 어떤 책을 쓰고 싶으신가요? 책의 주제나 키워드를 알려주세요." }]);
    setReadyForOutline(false);
    setHasConfirmedStyle(false);
    setBookStructure(null);
    setSubsectionContents({});
    setFactClaimsBySection({});
    setProgress({ total: 0, current: 0, status: 'idle' });
    setCoverImage(null);
    setCoverConcepts(null);
    setCoverPromptUsed('');
    setIsTestMode(true);
    setAutoFactCheckProgress({ current: 0, total: 0, status: '' });
    setFactCheckMode('web');
    setWritingFeedback('');
    setShowFeedbackInput(false);
    setFeedbackChatMessages([defaultFeedbackMessage]);
    setFactCheckLogs({});
    setShowRecoveryBanner(false);
    setTocExpandedChapters({});
    setShowDetailedToc(false);
  }

  const handleReset = useCallback(() => {
    if (window.confirm("현재 프로젝트의 모든 작업이 삭제됩니다. 정말 새로 시작하시겠습니까?")) {
      if (currentProjectId) {
        deleteProjectState(currentProjectId).catch(() => {});
      }
      resetState();
    }
  }, [currentProjectId]);

  return {
    projects,
    currentProjectId,
    showProjectSelector,
    editingProjectId,
    editingProjectName,
    setShowProjectSelector,
    createNewProject,
    switchProject,
    deleteProject: deleteProjectHandler,
    startEditingProject,
    saveProjectName,
    cancelEditingProject,
    setEditingProjectName,
    updateProjectName,
    
    step,
    setStep,
    messages,
    setMessages,
    readyForOutline,
    setReadyForOutline,
    hasConfirmedStyle,
    setHasConfirmedStyle,
    toneSettings,
    setToneSettings,
    customStyles,
    setCustomStyles,
    selectedCustomStyleId,
    setSelectedCustomStyleId,
    bookStructure,
    setBookStructure,
    subsectionContents,
    setSubsectionContents,
    factClaimsBySection,
    setFactClaimsBySection,
    factCheckMode,
    setFactCheckMode,
    progress,
    setProgress,
    coverImage,
    setCoverImage,
    coverConcepts,
    setCoverConcepts,
    coverPromptUsed,
    setCoverPromptUsed,
    currentTheme,
    setCurrentTheme,
    includeIntroOutro,
    setIncludeIntroOutro,
    isTestMode,
    setIsTestMode,
    writingFeedback,
    setWritingFeedback,
    showFeedbackInput,
    setShowFeedbackInput,
    feedbackChatMessages,
    setFeedbackChatMessages,
    showDetailedToc,
    setShowDetailedToc,
    tocExpandedChapters,
    setTocExpandedChapters,
    autoFactCheckProgress,
    setAutoFactCheckProgress,
    factCheckLogs,
    setFactCheckLogs,
    showRecoveryBanner,
    setShowRecoveryBanner,
    
    handleReset,
    saveProjectState,
  };
}

