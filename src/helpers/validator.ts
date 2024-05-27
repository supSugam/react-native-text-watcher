import * as vscode from 'vscode';
import { ScriptKind } from 'typescript';
import { extractAllNakedTexts } from './jsx';
import { getSeverityType } from '../commands/changeSeverityType';
import { DEFAULT_SEVERITY_TYPE } from '../utils/constants';

export const startValidating = (
  document: vscode.TextDocument,
  scriptKind: ScriptKind,
  diagnosticsCollection: vscode.DiagnosticCollection,
  severityTypeParam?: vscode.DiagnosticSeverity
) => {
  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();
  const nakedTextsWithRange = extractAllNakedTexts({
    content: text,
    scriptKind,
  });

  const severityType = severityTypeParam ?? getSeverityType() ?? DEFAULT_SEVERITY_TYPE;

  for (const text of nakedTextsWithRange) {
    const diagnostic = new vscode.Diagnostic(
      text.range,
      `Text string "${text.text}" must be rendered within a RN's <Text/> or one of the custom text components.`,
      severityType
    );
    diagnostics.push(diagnostic);
  }

  diagnosticsCollection.set(document.uri, diagnostics);
};
