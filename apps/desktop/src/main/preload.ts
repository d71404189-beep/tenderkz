import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  signDocument: (filePath: string) => ipcRenderer.invoke('sign-document', filePath),
  getEcpInfo: () => ipcRenderer.invoke('get-ecp-info'),
  saveFile: (data: ArrayBuffer, fileName: string) => ipcRenderer.invoke('save-file', data, fileName),
  onNotification: (callback: (data: unknown) => void) => {
    ipcRenderer.on('notification', (_event, data) => callback(data));
  },
});
