export interface Chapter {
  id: string;
  number: number;
  startMinute: number;
  endMinute: number;
  startPage: number;
  endPage: number;
}

export interface Book {
  id: string;
  title: string;
  order: number;
  audiobookMinutes: number;
  pages: number;
  chapters: Chapter[];
}

export interface BookProgress {
  unit: "pages" | "minutes";
  value: number;
}

export interface Series {
  id: string;
  name: string;
  books: Book[];
}

export interface NewRelease {
  title: string;
  series?: string;
  releaseDate: string;
  confirmed: boolean;
}

export interface BooksData {
  newRelease: NewRelease;
  series: Series[];
  notes?: string[];
}

export type Season = "night" | "spring" | "fall";
