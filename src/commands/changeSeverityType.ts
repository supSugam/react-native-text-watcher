import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { VSCodeDirs, extensionSettings } from '../utils/constants';
import { isString } from '../helpers/string';

export const changeSeverityType = async (
  newSeverityType: string
): Promise<boolean> => {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder open.');
    }
    // Create .vscode directory if it doesn't exist
    const vscodeDirectory = path.join(
      workspaceFolder.uri.fsPath,
      VSCodeDirs.vscode
    );
    if (!fs.existsSync(vscodeDirectory)) {
      fs.mkdirSync(vscodeDirectory);
    }

    // Create settings.json file if it doesn't exist
    const settingsJsonPath = path.join(
      vscodeDirectory,
      VSCodeDirs.settingsJson
    );
    if (!fs.existsSync(settingsJsonPath)) {
      fs.writeFileSync(settingsJsonPath, '{}');
    }

    const settingsJson = fs.readFileSync(settingsJsonPath, 'utf8');
    const settings = JSON.parse(settingsJson);
    settings[extensionSettings.severityType] = newSeverityType;
    fs.writeFileSync(settingsJsonPath, JSON.stringify(settings, null, 2));
    vscode.window.showInformationMessage(
      `Successfully Updated Severity Type to ${newSeverityType}.`
    );
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to Update Severity Type';
    vscode.window.showErrorMessage(errorMessage);
    return false;
  }
};

export const getSeverityType = (): vscode.DiagnosticSeverity | undefined => {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder open.');
    }
    const settingsJsonPath = path.join(
      workspaceFolder.uri.fsPath,
      VSCodeDirs.vscode,
      VSCodeDirs.settingsJson
    );
    if (!fs.existsSync(settingsJsonPath)) {
      return undefined;
    }
    const settingsJson = fs.readFileSync(settingsJsonPath, 'utf8');
    const settings = JSON.parse(settingsJson);
    const severityType = settings[extensionSettings.severityType];

    if (!severityType || !isString(severityType)) {
      return undefined;
    }
    return vscode.DiagnosticSeverity[
      severityType as keyof typeof vscode.DiagnosticSeverity
    ];
  } catch (error) {
    return undefined;
  }
};

export const getSeverityTypeAsString = (
  severity: vscode.DiagnosticSeverity
): string => {
  return vscode.DiagnosticSeverity[severity];
};
