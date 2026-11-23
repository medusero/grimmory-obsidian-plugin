import { toAnnotation } from "./annotationParser.ts";
import { type ParsedList, parseList } from "./listParser.ts";
import type { Annotation } from "./types.ts";

export function validateAnnotationList(value: unknown): ParsedList<Annotation> {
    return parseList(value, toAnnotation, "annotation list");
}
