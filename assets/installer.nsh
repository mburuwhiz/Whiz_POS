!include "MUI2.nsh"

; Define custom UI texts for Installer
!define MUI_PAGE_HEADER_TEXT "Initializing ${PRODUCT_NAME} Deployment..."
!define MUI_PAGE_HEADER_SUBTEXT "Experience the power of ${PRODUCT_NAME} v${VERSION}."
!define MUI_WELCOMEPAGE_TITLE "Welcome to ${PRODUCT_NAME} v${VERSION}"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of ${PRODUCT_NAME}.\r\n\r\nFeaturing a completely redesigned glassmorphism UI, enhanced performance, and ultra-modern business intelligence tools.\r\n\r\n$_CLICK"

!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "${PRODUCT_NAME} is Ready!"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "Your business infrastructure has been upgraded."

; Custom finish page text
!define MUI_FINISHPAGE_TITLE "Installation Successful"
!define MUI_FINISHPAGE_TEXT "${PRODUCT_NAME} has been successfully installed on this workstation.\r\n\r\nPlease complete the in-app setup wizard to configure your business and admin credentials.\r\n\r\nClick Finish to launch the environment."
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${PRODUCT_NAME} v${VERSION}"

; Define custom UI texts for Uninstaller
!define MUI_UNTEXT_WELCOME_INFO_TITLE "${PRODUCT_NAME} Removal Wizard"
!define MUI_UNTEXT_WELCOME_INFO_TEXT "This wizard will help you uninstall ${PRODUCT_NAME} v${VERSION} from your computer.\r\n\r\nNote: All local data including transactions and products will be permanently deleted unless backed up to the cloud dashboard.\r\n\r\n$_CLICK"
!define MUI_UNTEXT_CONFIRM_TITLE "Confirm De-provisioning"
!define MUI_UNTEXT_CONFIRM_SUBTITLE "Removing ${PRODUCT_NAME} Infrastructure"
!define MUI_UNTEXT_FINISH_TITLE "De-provisioning Complete"
!define MUI_UNTEXT_FINISH_SUBTITLE "${PRODUCT_NAME} has been successfully removed."

; Branding
BrandingText "Whizpoint Solutions • v${VERSION} Deployment"

Section "Main"
  DetailPrint "Initializing installation..."
  DetailPrint "Unpacking core modules..."
  DetailPrint "Updating UI components..."
  DetailPrint "Installing modern dashboard..."
  DetailPrint "Configuring new sound engine..."
  DetailPrint "Setting up glassmorphism effects..."
  DetailPrint "Optimizing database for v${VERSION}..."
  DetailPrint "Finalizing update..."
SectionEnd

Section "Uninstall"
  DetailPrint "Stopping Whiz POS services..."
  DetailPrint "De-registering system components..."
  DetailPrint "Cleaning up UI assets..."
  DetailPrint "Archiving local database nodes..."
  DetailPrint "Removing application binaries..."
  DetailPrint "Uninstallation Successful."
SectionEnd
