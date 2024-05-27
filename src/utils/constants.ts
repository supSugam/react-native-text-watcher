import { DiagnosticSeverity } from 'vscode';

export const extensionId = 'react-native-text-watcher';
export const commands = {
  manageCustomTextComponents: `${extensionId}.manageCustomTextComponents`,
  changeSeverityType: `${extensionId}.changeSeverityType`,
};

export const extensionSettings = {
  customTextComponents: `${extensionId}.customTextComponents`,
  severityType: `${extensionId}.severityType`,
};

export const VSCodeDirs = {
  vscode: '.vscode',
  settingsJson: 'settings.json',
};

export const DEFAULT_TEXT_COMPONENT = 'Text';

export const DiagnosticSeverityAsString = Object.values(
  DiagnosticSeverity
).filter((key) => typeof key === 'string') as string[];

export const DEFAULT_SEVERITY_TYPE = DiagnosticSeverity.Warning;
