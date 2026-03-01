!include "MUI2.nsh"

; Define custom UI texts
!define MUI_PAGE_HEADER_TEXT "Initializing Whiz POS Yearly Update..."
!define MUI_PAGE_HEADER_SUBTEXT "Experience the power of the new Whiz POS v2024."
!define MUI_WELCOMEPAGE_TITLE "Welcome to Whiz POS v2024"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the major yearly update of Whiz POS.\r\n\r\nFeaturing a completely redesigned UI, enhanced performance, and new business intelligence tools.\r\n\r\n$_CLICK"

!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Whiz POS is Ready!"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "Your business just got a major upgrade."

; Custom finish page text
!define MUI_FINISHPAGE_TITLE "Update Successful"
!define MUI_FINISHPAGE_TEXT "Whiz POS has been successfully updated to the latest version.\r\n\r\nPlease check your printed startup receipt for new features and credentials if applicable.\r\n\r\nClick Finish to close this wizard."
!define MUI_FINISHPAGE_RUN_TEXT "Launch Whiz POS v2024"

; Branding
BrandingText "Whizpoint Solutions • Major Yearly Update 2024"

Section "Main"
  DetailPrint "Initializing installation..."
  DetailPrint "Updating UI components..."
  DetailPrint "Installing modern dashboard..."
  DetailPrint "Configuring new sound engine..."
  DetailPrint "Setting up glassmorphism effects..."
  DetailPrint "Optimizing database for v2024..."
  DetailPrint "Finalizing update..."
SectionEnd
