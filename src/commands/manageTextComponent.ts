import { ActionEnum } from '../enum/ActionEnum';
import {
  containsInvalidCharForComponent,
  startsWithCapitalAlphabet,
  startsWithLowerCaseAlphabet,
} from '../helpers/string';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  DEFAULT_TEXT_COMPONENT,
  VSCodeDirs,
  extensionSettings,
} from '../utils/constants';
import { onlyStringArray, uniquedArray } from '../helpers/array';

export const onManageTextComonentAction = async (
  action: ActionEnum
): Promise<boolean> => {
  switch (action) {
    case ActionEnum.Add:
      return await onAddAction();
    case ActionEnum.Remove:
      return await onRemoveAction();
  }
};

const onAddAction = async (): Promise<boolean> => {
  // Add custom text components
  const existingComponents = getCustomTextComponents();
  const userInput = await vscode.window.showInputBox({
    title: 'Add Custom Text Components to suppress warnings for',
    placeHolder: 'Eg: MyText, StyledText, CustomText',
    validateInput(value) {
      if (!value) {
        return 'You must enter at least one custom text component';
      }

      const components = value.trim().endsWith(',')
        ? value.trim().slice(0, -1).split(',')
        : value.trim().split(',');

      for (const component of components) {
        const trimmed = component.trim();
        if (!trimmed) {
          return 'Component name cannot be empty';
        }
        if (startsWithLowerCaseAlphabet(trimmed)) {
          return `Component name can only start with a capital alphabet or '_' or '$'`;
        }

        if (trimmed.includes(' ')) {
          return `Component name cannot contain white spaces`;
        }

        if (containsInvalidCharForComponent(trimmed)) {
          return `Component name can only contain alphabets, numbers, '_' and '$'`;
        }

        if (existingComponents.includes(trimmed)) {
          return `Component "${trimmed}" already exists`;
        }
      }
      return null;
    },
    prompt: 'Enter your custom text components separated by a comma.',
    valueSelection: [0, 0],
  });

  if (userInput === undefined) {
    // User cancelled the input
    return false;
  }

  const customTextComponents = userInput
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  // Get the workspace folder for the current workspace
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return false;
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
  const settingsJsonPath = path.join(vscodeDirectory, VSCodeDirs.settingsJson);
  if (!fs.existsSync(settingsJsonPath)) {
    fs.writeFileSync(settingsJsonPath, '{}');
  }

  // Read settings.json file
  const settingsJson = fs.readFileSync(settingsJsonPath, 'utf8');
  const settings = JSON.parse(settingsJson);

  // Add custom text components to settings.json
  settings[extensionSettings.customTextComponents] = uniquedArray([
    ...customTextComponents,
    ...existingComponents.filter((c) => c !== DEFAULT_TEXT_COMPONENT),
  ]);

  // Write settings.json file
  fs.writeFileSync(settingsJsonPath, JSON.stringify(settings, null, 2));

  vscode.window.showInformationMessage(
    'Successfully Added, You will no longer see warnings for these components.'
  );
  return true;
};

const onRemoveAction = async (): Promise<boolean> => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return false;
  }
  const settingsJsonPath = path.join(
    workspaceFolder.uri.fsPath,
    VSCodeDirs.vscode,
    VSCodeDirs.settingsJson
  );

  if (!fs.existsSync(settingsJsonPath)) {
    vscode.window.showErrorMessage('No custom text components to remove.');
    return false;
  }

  const settingsJson = fs.readFileSync(settingsJsonPath, 'utf8');
  const settings = JSON.parse(settingsJson);
  const customTextComponents: string[] =
    settings[extensionSettings.customTextComponents] || [];

  if (
    customTextComponents.length === 0 ||
    (customTextComponents.length === 1 &&
      customTextComponents[0] === DEFAULT_TEXT_COMPONENT)
  ) {
    vscode.window.showErrorMessage('No custom text components to remove.');
    return false;
  }

  const customTextComponentArray = uniquedArray(
    onlyStringArray(customTextComponents)
  ).filter((c) => c !== DEFAULT_TEXT_COMPONENT);
  const componentToRemove = await vscode.window.showQuickPick(
    customTextComponentArray,
    {
      placeHolder: 'Select all the components that you want to remove',
      canPickMany: true,
      title: 'Remove Custom Text Components',
    }
  );

  if (!componentToRemove) {
    // User cancelled component selection
    return false;
  }

  const updatedComponents = customTextComponentArray.filter(
    (component) => !componentToRemove.includes(component)
  );

  settings[extensionSettings.customTextComponents] = updatedComponents;

  fs.writeFileSync(settingsJsonPath, JSON.stringify(settings, null, 2));

  vscode.window.showInformationMessage(
    `Removed "${componentToRemove}", You'll now see warnings for this component.`
  );
  return true;
};

export const areAllComponentsValid = (components: string[]): boolean => {
  for (const component of components) {
    if (!startsWithCapitalAlphabet(component)) {
      return false;
    }
  }
  return true;
};

export const getCustomTextComponents = (): string[] => {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return [DEFAULT_TEXT_COMPONENT];
    }
    const settingsJsonPath = path.join(
      workspaceFolder.uri.fsPath,
      VSCodeDirs.vscode,
      VSCodeDirs.settingsJson
    );
    if (!fs.existsSync(settingsJsonPath)) {
      return [DEFAULT_TEXT_COMPONENT];
    }
    const settingsJson = fs.readFileSync(settingsJsonPath, 'utf8');
    const settings = JSON.parse(settingsJson);
    const customTextComponents =
      settings[extensionSettings.customTextComponents];
    if (!customTextComponents || !Array.isArray(customTextComponents)) {
      return [DEFAULT_TEXT_COMPONENT];
    }

    const customTextComponentsArray = uniquedArray(
      onlyStringArray(customTextComponents)
    ).filter((c) => c !== DEFAULT_TEXT_COMPONENT);

    if (!areAllComponentsValid(customTextComponentsArray)) {
      return [DEFAULT_TEXT_COMPONENT];
    }
    return [...customTextComponents, DEFAULT_TEXT_COMPONENT];
  } catch (error) {
    return [DEFAULT_TEXT_COMPONENT];
  }
};
