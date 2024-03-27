import React, { useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import FormAlert from "components/FormAlert";
import Button from "components/Button";
import LoadingIcon from "components/LoadingIcon";
import { useAuth } from "util/auth";
import { useDocument, updateDocument, createDocument } from "util/db";

function EditDocumentModal(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);

  const { register, handleSubmit, errors } = useForm();

  const { data: documentData, status: documentStatus } = useDocument(props.id);

  if (props.id && documentStatus !== "success") {
    return null;
  }

  const onSubmit = async (data) => {
    setPending(true);

    const { title, file } = data;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file[0]);

    const query = props.id
      ? updateDocument(props.id, formData)
      : createDocument(props.classId, formData);

    query
      .then(() => {
        props.onDone();
      })
      .catch((error) => {
        setPending(false);
        setFormAlert({
          type: "error",
          message: error.message,
        });
      });
  };

  return (
    <Transition appear={true} show={true}>
      <Dialog
        as="div"
        className="overflow-y-auto fixed inset-0 z-10"
        onClose={() => props.onDone()}
      >
        <div className="px-4 min-h-screen text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />
          </Transition.Child>
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-md text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {props.id ? "Update" : "Upload"} Document
              </Dialog.Title>
              <div className="mt-4">
                {formAlert && (
                  <div className="mb-4">
                    <FormAlert
                      type={formAlert.type}
                      message={formAlert.message}
                    />
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={documentData && documentData.title}
                      ref={register({ required: "Please enter a title" })}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                      File
                    </label>
                    <input
                      type="file"
                      name="file"
                      id="file"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      ref={register({ required: "Please select a file" })}
                    />
                    {errors.file && (
                      <p className="mt-2 text-sm text-red-600">{errors.file.message}</p>
                    )}
                  </div>
                  <div className="space-x-2 flex items-stretch">
                    <Button
                      size="md"
                      variant="simple"
                      onClick={() => props.onDone()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="md"
                      disabled={pending}
                      isBlock={true}
                      className="w-20"
                    >
                      {!pending && <>Save</>}

                      {pending && <LoadingIcon className="w-5" />}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditDocumentModal;