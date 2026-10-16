import { useContext, createContext, useMemo, useState, useCallback } from 'react'
import useGetDocumentLabel from '~/hooks/Setup/DocumentSetup/useGetDocumentLabel';
import useGetDocumentFiles from '~/hooks/Setup/DocumentSetup/useGetDocumentFiles';

const DocumentContext = createContext(null);

export function useDocumentContext() {
  const store = useContext(DocumentContext)
  if (!store) {
    throw new Error("useDocumentContext must be used within the DocumentProvider")
  }
  return store
}

const DocumentProvider = ({ children }) => {
  /*THE ROW PICKED IN THE TABS BELOW, WHICH THE ADD FORM ABOVE EDITS - NULL = ADDING*/
  const [editingDocument, setEditingDocument] = useState(null);
  const { isLoading, isSuccess, data, isError, error } = useGetDocumentLabel();
  const {
    isLoading: isLoadingDocuments,
    isSuccess: isSuccessDocuments,
    data: documentData,
    isError: isErrorDocuments,
    error: documentError,
  } = useGetDocumentFiles();

  const tabLabels = useMemo(() => {
    if (!isSuccess) return []

    /*THE PROC RETURNS THE RAW DATATABLE COLUMNS, WHICH THE SERVICE LOWERCASES*/
    return (data?.body ?? []).map((item) => ({
      value: item.id.toString(),
      label: item.label,
    }))
  }, [isSuccess, data])

  /**
   * The documents arrive flat, one row per document with its document type. They are
   * bucketed by LABEL_ID here so a tab is one lookup instead of a filter per render.
   */
  const documentsByLabel = useMemo(() => {
    if (!isSuccessDocuments) return {}

    return (documentData?.body ?? []).reduce((groups, document) => {
      const key = document.label_id.toString();

      groups[key] = groups[key] ?? [];
      groups[key].push(document);

      return groups;
    }, {})
  }, [isSuccessDocuments, documentData])

  /*A NEW OBJECT EVERY TIME, SO PICKING THE SAME ROW TWICE STILL REFILLS THE FORM*/
  const onEditDocument = useCallback((document) => {
    setEditingDocument({ ...document });
  }, [])

  const onClearEditing = useCallback(() => {
    setEditingDocument(null);
  }, [])

  const store = useMemo(() => ({
    tabLabels,
    isLoading,
    isError,
    error,
    documentsByLabel,
    isLoadingDocuments,
    isErrorDocuments,
    documentError,
    editingDocument,
    onEditDocument,
    onClearEditing,
  }), [
    tabLabels,
    isLoading,
    isError,
    error,
    documentsByLabel,
    isLoadingDocuments,
    isErrorDocuments,
    documentError,
    editingDocument,
    onEditDocument,
    onClearEditing,
  ])

  return (
    <DocumentContext.Provider value={store}>
      {children}
    </DocumentContext.Provider>
  );
}

export default DocumentProvider;
