import * as vscode from 'vscode';
import { ScriptKind } from 'typescript';
import { extractAllNakedTexts } from './jsx';

export const startValidating = (
  document: vscode.TextDocument,
  scriptKind: ScriptKind,
  diagnosticsCollection: vscode.DiagnosticCollection
) => {
  const diagnostics: vscode.Diagnostic[] = [];
  // Extract all JSX portions
  const text = document.getText();
  const nakedTextsWithRange = extractAllNakedTexts({
    content: text,
    scriptKind,
  });

  // Issue diagnostics warning for each naked text

  for (const text of nakedTextsWithRange) {
    const diagnostic = new vscode.Diagnostic(
      text.range,
      `Text string "${text.text}" must be rendered within a <Text> component`,
      vscode.DiagnosticSeverity.Warning
    );
    diagnostics.push(diagnostic);
  }

  diagnosticsCollection.set(document.uri, diagnostics);
};
