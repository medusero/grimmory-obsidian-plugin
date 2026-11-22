export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expires: number;
}

export interface Annotation {
    cfi: string;
    text: string;
    chapterTitle?: string;
}

export interface BookNote {
    cfi: string;
    noteContent: string;
    chapterTitle?: string;
}

export interface BookEntry {
    cfi: string;
    highlightText?: string;
    noteText?: string;
    chapterTitle?: string;
}

export interface Book {
    bookId: number;
    bookTitle: string;
}
