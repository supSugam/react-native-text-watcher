import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { startValidating } from './helpers/validator';
import {
  DiagnosticSeverityAsString,
  commands,
  extensionId,
} from './utils/constants';
import { ActionEnum } from './enum/ActionEnum';
import { onManageTextComonentAction } from './commands/manageTextComponent';
import { changeSeverityType } from './commands/changeSeverityType';

function getUserTypescript(project: string): any | null {
  try {
    const tsPath = path.join(project, 'node_modules', 'typescript');
    if (fs.existsSync(tsPath)) {
      return require(tsPath);
    }
    return null;
  } catch (error) {
    console.error("Could not load user's TypeScript:", error);
    return null;
  }
}

// Usage
export let ts: any | null = null;

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open.');
    throw new Error('No workspace folder open.');
  }

  const project = await getReactNativeProject(workspaceFolders);
  if (!project) return;
  ts = getUserTypescript(project);
  if (!ts) {
    vscode.window.showErrorMessage(
      'TypeScript not found in your workspace. Please install it.'
    );
    throw new Error(
      'TypeScript not found in your workspace. Please install it.'
    );
  }
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

async function getReactNativeProject(
  workspaceFolders: readonly vscode.WorkspaceFolder[]
): Promise<string | null> {
  if (!workspaceFolders?.length) return null;

  const rootPath = workspaceFolders[0].uri.fsPath;
  const paths: string[] = [rootPath];

  try {
    const items = fs.readdirSync(rootPath, { withFileTypes: true });

    items.forEach((item) => {
      if (item.isDirectory() && !item.name.startsWith('.')) {
        paths.push(path.join(rootPath, item.name));
      }
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }

  for (const folder of paths) {
    const packageJsonPath = vscode.Uri.file(path.join(folder, 'package.json'));

    try {
      const packageJsonContent = await vscode.workspace.fs.readFile(
        packageJsonPath
      );
      const packageJson = JSON.parse(packageJsonContent.toString());

      if (
        packageJson.dependencies?.['react-native'] &&
        packageJson.devDependencies?.['typescript']
      ) {
        return folder; // Found a React Native project
      }
    } catch (err) {
      // Ignore missing package.json files
    }
  }

  return null;
}

export function deactivate() {}
