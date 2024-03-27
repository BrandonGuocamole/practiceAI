import React from "react";
import { useDocumentsByClass } from "util/db";
import { TrashIcon, EyeIcon, DownloadIcon } from "@heroicons/react/24/solid";
import { deleteDocument } from "util/db";

const DocumentList = ({ classId }) => {
    console.log("DocumentList component rendered");
  const {
    data: documents,
    status: documentsStatus,
    error: documentsError,
  } = useDocumentsByClass(classId);

  if (documentsStatus === "loading") {
    return <div>Loading documents...</div>;
  }

  if (documentsStatus === "error") {
    return <div>Error: {documentsError.message}</div>;
  }

  const handlePreview = (filePath) => {
    window.open(filePath, "_blank");
  };

  const handleDownload = (filePath, title) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = title;
    link.click();
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Documents</h3>
      {documents && documents.length === 0 ? (
        <div>No documents uploaded yet.</div>
      ) : (
        <ul>
          {documents && documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between py-2">
              <span>{document.title}</span>
              <div className="flex items-center space-x-2">
                <button
                  className="w-5 h-5 text-slate-600"
                  onClick={() => handlePreview(document.file_path)}
                >
                  <EyeIcon />
                </button>
                <button
                  className="w-5 h-5 text-slate-600"
                  onClick={() => handleDownload(document.file_path, document.title)}
                >
                  <DownloadIcon />
                </button>
                <button
                  className="w-5 h-5 text-slate-600"
                  onClick={() => deleteDocument(document.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default DocumentList;