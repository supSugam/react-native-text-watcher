import * as vscode from 'vscode';
import { getCustomTextComponents } from '../commands/manageTextComponent';
import { ts } from '../extension';
export type ScriptKind = any;
type Node = any;

interface IExtractAllJSXPortionsProps {
  content: string;
  scriptKind: ScriptKind;
}

interface INakedTextWithRange {
  text: string;
  range: vscode.Range;
}

function isJsxStringLiteral(text: string): boolean {
  return text.match(/\{(?:['"`])(.*?)(?:['"`])\}/g) !== null;
}

function isNakedText(node: Node): boolean {
  if (!ts) {
    throw new Error(
      'TypeScript not found in your workspace. Please install it.'
    );
  }
  const ALL_TAGS_TO_IGNORE = getCustomTextComponents();

  if (isOneOfTheseTags(node, ALL_TAGS_TO_IGNORE)) {
    return false;
  }

  if (!hasAtLeastOneJSXAncestor(node)) {
    return false;
  }

  if (ts.isCallExpression(node.parent)) {
    return false;
  }

  if (!ts.isJsxText(node) && !ts.isStringLiteralLike(node)) {
    return false;
  }

  if (!isNotAPartOfProps(node)) {
    return false;
  }

  const text = node.getText().trim();

  if (text.match(/^\s*$/) !== null) {
    return false;
  }

  if (text.startsWith('{') && text.endsWith('}')) {
    if (isJsxStringLiteral(text)) {
      return false;
    }
  }

  return true;
}

export function extractAllNakedTexts({
  content,
  scriptKind,
}: IExtractAllJSXPortionsProps): INakedTextWithRange[] {
  if (!ts) {
    console.error('TypeScript not found in your workspace. Please install it.');
    return [];
  }
  const nakedTexts: INakedTextWithRange[] = [];
  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  function visit(node: Node) {
    if (isNakedText(node)) {
      const start = node.getStart();
      const end = node.getEnd();

      const trimmedStart = content.substring(start).search(/\S/);
      const trimmedEnd = content.substring(0, end).match(/\S\s*$/)?.index;

      if (trimmedStart !== -1 && trimmedEnd !== undefined) {
        const text = content.substring(
          start + trimmedStart,
          end - (end - trimmedEnd) + 1
        );

        const startPosition = sourceFile.getLineAndCharacterOfPosition(
          start + trimmedStart
        );
        const endPosition = sourceFile.getLineAndCharacterOfPosition(
          end - (end - trimmedEnd) + 1
        );

        const range = new vscode.Range(
          new vscode.Position(startPosition.line, startPosition.character),
          new vscode.Position(endPosition.line, endPosition.character)
        );

        nakedTexts.push({ text, range });
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);

  return nakedTexts;
}

const hasAtLeastOneJSXAncestor = (node: Node): boolean => {
  if (!ts) {
    throw new Error(
      'TypeScript not found in your workspace. Please install it.'
    );
  }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    return true;
  }
  if (node.parent) {
    return hasAtLeastOneJSXAncestor(node.parent);
  }
  return false;
};

const isNotAPartOfProps = (node: Node): boolean => {
  if (!ts) {
    throw new Error(
      'TypeScript not found in your workspace. Please install it.'
    );
  }
  if (ts.isJsxAttribute(node)) {
    return false;
  }
  if (node.parent) {
    return isNotAPartOfProps(node.parent);
  }
  return true;
};

const isOneOfTheseTags = (node: Node, tags: string[]): boolean => {
  const tagPattern = /<([^\/\s>]+)/;
  const nodeTag = tagPattern.exec(node.getText())?.[1] ?? null;

  if (nodeTag && tags.includes(nodeTag)) {
    return true;
  } else {
    if (node.parent) {
      return isOneOfTheseTags(node.parent, tags);
    }
  }

  return false;
};
