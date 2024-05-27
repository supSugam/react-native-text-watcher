import * as vscode from 'vscode';
import * as path from 'path';
import * as ts from 'typescript';
import { startValidating } from './helpers/validator';
import {
  DiagnosticSeverityAsString,
  commands,
  extensionId,
} from './utils/constants';
import { ActionEnum } from './enum/ActionEnum';
import { onManageTextComonentAction } from './commands/manageTextComponent';
import { changeSeverityType } from './commands/changeSeverityType';

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  const shouldActivate =
    workspaceFolder && (await isReactNativeProject(workspaceFolder));

  if (!shouldActivate) return;
  const diagnosticsCollection =
    vscode.languages.createDiagnosticCollection(extensionId);

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
    vscode.commands.registerCommand(
      commands.manageCustomTextComponents,
      async () => {
        try {
          const action = await vscode.window.showQuickPick(
            Object.values(ActionEnum),
            { placeHolder: 'Select an action, Add or Remove Components.' }
          );
          if (!action) return;
          const success = await onManageTextComonentAction(
            action as ActionEnum
          );

          if (success) {
            for (const document of vscode.workspace.textDocuments) {
              if (document.languageId === 'typescriptreact') {
                startValidating(
                  document,
                  ts.ScriptKind.TSX,
                  diagnosticsCollection
                );
              }
              if (document.languageId === 'javascriptreact') {
                startValidating(
                  document,
                  ts.ScriptKind.JSX,
                  diagnosticsCollection
                );
              }
            }
          }
        } catch (error) {
          vscode.window.showErrorMessage(
            'Failed to manage custom text components'
          );
        }
      }
    ),
    vscode.commands.registerCommand(commands.changeSeverityType, async () => {
      const severityType = await vscode.window.showQuickPick(
        DiagnosticSeverityAsString,
        {
          placeHolder: 'Select a New Severity Type',
          title: 'Severity Type for RN Text Warnings',
        }
      );
      if (!severityType) return;
      const success = await changeSeverityType(severityType);

      if (success) {
        for (const document of vscode.workspace.textDocuments) {
          if (document.languageId === 'typescriptreact') {
            startValidating(document, ts.ScriptKind.TSX, diagnosticsCollection);
          }
          if (document.languageId === 'javascriptreact') {
            startValidating(document, ts.ScriptKind.JSX, diagnosticsCollection);
          }
        }
      }
    }),
    diagnosticsCollection
  );
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
