export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expires: number;
}

export interface Annotation {
    id: number;
    userId: number;
    bookId: number;
    cfi: string;
    text: string;
    color: string;
    note: string;
    chapterTitle: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookNote {
    id: number;
    userId: number;
    bookId: number;
    cfi: string;
    selectedText: string;
    noteContent: string;
    color: string;
    chapterTitle: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookEntry {
    cfi: string;
    highlightText?: string;
    noteText?: string;
    color?: string;
    chapterTitle?: string;
    createdAt?: string;
}

export interface Book {
    bookId: number;
    bookTitle: string;
}
