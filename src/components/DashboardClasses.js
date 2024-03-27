import React, { useState } from "react";
import { PencilSquareIcon, TrashIcon, CloudArrowDownIcon, FolderOpenIcon} from "@heroicons/react/24/solid";
import FormAlert from "components/FormAlert";
import Button from "components/Button";
import EditClassModal from "components/EditClassModal";
import { useAuth } from "util/auth";
import { updateClass, deleteClass, useClassesByOwner } from "util/db";
import EditDocumentModal from "components/EditDocumentModal";
import DocumentListModal from "./DocumentListModal";

export default function DashboardClasses({ setSelectedClassId }) {
  const auth = useAuth();

  const {
    data: classes,
    status: classesStatus,
    error: classesError,
  } = useClassesByOwner(auth.user.uid);

  const [creatingClass, setCreatingClass] = useState(false);

  const [updatingClassId, setUpdatingClassId] = useState(null);

  const classesAreEmpty = !classes || classes.length === 0;

  const [creatingDocument, setCreatingDocument] = useState(false);
  
  const [updatingDocumentId, setUpdatingDocumentId] = useState(null);
  const [selectedClassIdForDocument, setSelectedClassIdForDocument] = useState(null);
  const [isDocumentListModalOpen, setIsDocumentListModalOpen] = useState(false);


  return (
    <>
      {classesError && (
        <div className="mb-4">
          <FormAlert type="error" message={classesError.message} />
        </div>
      )}

      <div>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-xl">Classes</span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setCreatingClass(true)}
          >
            Add Class
          </Button>
        </div>

        {(classesStatus === "loading" || classesAreEmpty) && (
          <div className="p-8">
            {classesStatus === "loading" && <>Loading...</>}

            {classesStatus !== "loading" && classesAreEmpty && (
              <>Nothing yet. Click the button to add your first class.</>
            )}
          </div>
        )}

        {classesStatus !== "loading" && classes && classes.length > 0 && (
          <>
            {classes.map((classItem, index) => (
              <div className="flex p-4 border-b border-gray-200 cursor-pointer" key={index} onClick={() => setSelectedClassId(classItem.id)}>
                {classItem.name}
                <div className="flex items-center ml-auto space-x-3">
                <button
                    className="w-5 h-5 text-slate-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClassIdForDocument(classItem.id);
                      setIsDocumentListModalOpen(true);
                    }}
                  >
                    <FolderOpenIcon />
                </button>
                  <button
                    className="w-5 h-5 text-slate-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClassIdForDocument(classItem.id);
                      setCreatingDocument(true);}

                    }
                  >
                    <CloudArrowDownIcon />
                  </button>
                  <button
                    className="w-5 h-5 text-slate-600"
                    onClick={() => {setUpdatingClassId(classItem.id);}}
                  >
                    <PencilSquareIcon />
                  </button>
                  <button
                    className="w-5 h-5 text-slate-600"
                    onClick={() => deleteClass(classItem.id)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {isDocumentListModalOpen && (<DocumentListModal
        isOpen={isDocumentListModalOpen}
        onClose={() => setIsDocumentListModalOpen(false)}
        classId={selectedClassIdForDocument}
      />)}

      {creatingClass && (
        <EditClassModal onDone={() => setCreatingClass(false)} />
      )}

      {updatingClassId && (
        <EditClassModal
          id={updatingClassId}
          onDone={() => setUpdatingClassId(null)}
        />
      )}

{creatingDocument && (
  <EditDocumentModal
    classId={selectedClassIdForDocument}
    onDone={() => {
      setCreatingDocument(false);
      setSelectedClassIdForDocument(null);
    }}
  />
)}

{updatingDocumentId && (
  <EditDocumentModal
    id={updatingDocumentId}
    onDone={() => setUpdatingDocumentId(null)}
  />
)}


    </>
  );
}