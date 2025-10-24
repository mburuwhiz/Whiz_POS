import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe, limited API to the renderer process (our Svelte app).
contextBridge.exposeInMainWorld('electron', {
  storeToken: (token: string) => ipcRenderer.send('store-token', token),
  getToken: () => ipcRenderer.invoke('get-token'),
});
