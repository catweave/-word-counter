import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

// Подсчёт слов
function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.length : 0;
}

// Подсчёт строк
function countLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return text.split(/\r\n|\r|\n/).length;
}

// Обновление статус-бара по активному редактору
function updateStatusBar(): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    statusBarItem.text = '$(file) Word Counter: нет файла';
    statusBarItem.tooltip = 'Откройте файл, чтобы увидеть статистику';
    return;
  }

  const text = editor.document.getText();
  const words = countWords(text);
  const lines = countLines(text);
  const chars = text.length;

  statusBarItem.text = `$(file) Слов: ${words} | Строк: ${lines} | Символов: ${chars}`;
  statusBarItem.tooltip = `Word Counter\nСлов: ${words}\nСтрок: ${lines}\nСимволов: ${chars}\n\nКликните для подробностей`;
}

export function activate(context: vscode.ExtensionContext) {
  // Создаём элемент статус-бара
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'word-counter.showStats';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Команда «Показать статистику»
  context.subscriptions.push(
    vscode.commands.registerCommand('word-counter.showStats', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          'Word Counter: откройте файл, чтобы увидеть статистику.'
        );
        return;
      }
      const text = editor.document.getText();
      const words = countWords(text);
      const lines = countLines(text);
      const chars = text.length;

      vscode.window.showInformationMessage(
        `Файл: ${editor.document.fileName.split('/').pop()}\n` +
          `Слов: ${words}\n` +
          `Строк: ${lines}\n` +
          `Символов: ${chars}`
      );
    })
  );

  // Обновление при переключении файла
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => updateStatusBar())
  );

  // Обновление при вводе текста
  let timer: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === vscode.window.activeTextEditor?.document) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(updateStatusBar, 200);
      }
    })
  );

  // Обновление при сохранении
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc === vscode.window.activeTextEditor?.document) {
        updateStatusBar();
      }
    })
  );

  // Первичное обновление
  updateStatusBar();
}

export function deactivate() {
}