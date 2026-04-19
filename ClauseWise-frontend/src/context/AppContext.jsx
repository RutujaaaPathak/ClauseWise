import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Service_Agreement_v4_Final.pdf',
      size: '3.2 MB',
      category: 'Cloud Infrastructure',
      type: 'MSA',
      scanDate: 'Oct 24, 2024',
      safetyScore: 88,
      riskLevel: 'LOW RISK',
      status: 'complete',
    },
    {
      id: '2',
      name: 'Employment_Contract_NY.pdf',
      size: '1.8 MB',
      category: 'HR / Legal',
      type: 'Employment',
      scanDate: 'Oct 22, 2024',
      safetyScore: 42,
      riskLevel: 'CRITICAL',
      status: 'complete',
    },
    {
      id: '3',
      name: 'NDA_Partnership_Alpha.pdf',
      size: '840 KB',
      category: 'Confidentiality',
      type: 'NDA',
      scanDate: 'Oct 19, 2024',
      safetyScore: 94,
      riskLevel: 'SAFE',
      status: 'complete',
    },
  ]);

  const [activeDocument, setActiveDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const addDocument = useCallback((doc) => {
    setDocuments(prev => [doc, ...prev]);
  }, []);

  const removeDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      documents, addDocument, removeDocument,
      activeDocument, setActiveDocument,
      uploadProgress, setUploadProgress,
      isAnalyzing, setIsAnalyzing,
      analysisResult, setAnalysisResult,
    }}>
      {children}
    </AppContext.Provider>
  );
};
