import * as vscode from 'vscode';
import * as path from 'path';
import * as ts from 'typescript';
import { startValidating } from './helpers/validator';

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  const shouldActivate =
    workspaceFolder && (await isReactNativeProject(workspaceFolder));

  if (shouldActivate) {
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

async function isReactNativeProject(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<boolean> {
  const packageJsonPath = vscode.Uri.file(
    path.join(workspaceFolder.uri.fsPath, 'package.json')
  );
  const packageJsonContent = await vscode.workspace.fs.readFile(
    packageJsonPath
  );
  const packageJson = JSON.parse(packageJsonContent.toString());
  return !!packageJson.dependencies?.['react-native'];
}

export function deactivate() {}
