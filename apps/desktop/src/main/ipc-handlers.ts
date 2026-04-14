import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

ipcMain.handle('sign-document', async (_event, filePath: string) => {
  // TODO: integrate Kalkan JCP for ECP signing
  // This will call KalkanCrypto.signXML(filePath) via Java bridge
  console.log(`[ECP] Signing document: ${filePath}`);
  return { success: false, message: 'ECP module not yet integrated' };
});

ipcMain.handle('get-ecp-info', async () => {
  // TODO: read ECP token info via Kalkan
  console.log('[ECP] Reading token info');
  return { available: false, owner: null, validTo: null };
});

ipcMain.handle('save-file', async (_event, data: ArrayBuffer, fileName: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Сохранить документ',
    defaultPath: fileName,
    filters: [{ name: 'Documents', extensions: ['docx', 'pdf'] }],
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, Buffer.from(data));
    return { success: true, filePath };
  }
  return { success: false };
});
