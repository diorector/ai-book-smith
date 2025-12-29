export interface Subsection {
  sub_number: number;
  title: string;
  detail: string;
}

export interface Chapter {
  chapter_number: number;
  title: string;
  subsections: Subsection[];
}

export interface BookStructure {
  title: string;
  target_audience: string;
  concept: string;
  keywords?: string[];
  chapters: Chapter[];
}

export interface TocChapter {
  chapter_number: number;
  title: string;
  subsections: {
    sub_number: number;
    title: string;
  }[];
}

