import * as vscode from 'vscode';
import * as path from 'path';
import * as ts from 'typescript';
import { startValidating } from './helpers/validator';

export function activate(context: vscode.ExtensionContext) {
  const packageJsonPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    ? path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'package.json')
    : undefined;

  if (packageJsonPath && isReactNativeProject(packageJsonPath)) {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection(
      'text-string-validator'
    );

    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'typescriptreact') {
          startValidating(document, ts.ScriptKind.TSX, diagnosticsCollection);
        }
        if (document.languageId === 'javascriptreact') {
          startValidating(document, ts.ScriptKind.JSX, diagnosticsCollection);
        }
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'typescriptreact') {
          startValidating(
            event.document,
            ts.ScriptKind.TSX,
            diagnosticsCollection
          );
        }
        if (event.document.languageId === 'javascriptreact') {
          startValidating(
            event.document,
            ts.ScriptKind.JSX,
            diagnosticsCollection
          );
        }
      }),
      vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'typescriptreact') {
          startValidating(document, ts.ScriptKind.TSX, diagnosticsCollection);
        }
        if (document.languageId === 'javascriptreact') {
          startValidating(document, ts.ScriptKind.JSX, diagnosticsCollection);
        }
      }),
      diagnosticsCollection
    );
  }
}

function isReactNativeProject(packageJsonPath: string): boolean {
  const packageJson = require(packageJsonPath);
  return !!packageJson.dependencies?.['react-native'];
}

export function deactivate() {}
