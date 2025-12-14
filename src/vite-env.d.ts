/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

// some global object injected by platform
declare global {
  interface Window {
    aiSdk?: Record<string, any>;
    ywConfig?: Record<string, any>;
    ywSdk?: Record<string, any>;
    electron: {
      saveData: (fileName: string, data: any) => Promise<{ success: boolean; error?: any }>;
      readData: (fileName: string) => Promise<{ success: boolean; data?: any; error?: any }>;
      printReceipt: (transaction: any, businessSetup: any, isReprint?: boolean) => void;
      saveImage: (tempPath: string) => Promise<{ success: boolean; path?: string; fileName?: string; error?: any }>;
      printClosingReport: (reportData: any, businessSetup: any) => void;
      getApiConfig: () => Promise<{ apiKey: string; apiUrl: string; qrCodeDataUrl: string }>;
      printBusinessSetup: (businessSetup: any, adminUser: any) => void;
      uploadImage: (filePath: string, apiUrl: string, apiKey: string) => Promise<{ success: boolean; imageUrl: string }>;
      onMobileDataSync: (callback: (event: any, data: any) => void) => void;
      onNewMobileReceipt: (callback: (event: any, data: any) => void) => void;
      getPrinters: () => Promise<any[]>;
      savePrinterSettings: (settings: any) => Promise<{ success: boolean }>;
      getPrinterSettings: () => Promise<any>;
      toggleFullscreen: () => void;
      checkForUpdate: () => void;
      onUpdateAvailable: (callback: (event: any, info: any) => void) => void;
      onUpdateDownloaded: (callback: (event: any, info: any) => void) => void;
    };
  }
}

export {};
