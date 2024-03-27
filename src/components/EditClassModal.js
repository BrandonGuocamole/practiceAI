import React, { useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import FormAlert from "components/FormAlert";
import TextField from "components/TextField";
import Button from "components/Button";
import LoadingIcon from "components/LoadingIcon";
import { useAuth } from "util/auth";
import { useClass, updateClass, createClass } from "util/db";

function EditClassModal(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);

  const { register, handleSubmit, errors } = useForm();

  const { data: classData, status: classStatus } = useClass(props.id);

  if (props.id && classStatus !== "success") {
    return null;
  }

  const onSubmit = (data) => {
    setPending(true);

    const query = props.id
      ? updateClass(props.id, data)
      : createClass({ owner: auth.user.uid, ...data });

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
                {props.id ? "Update" : "Create"} Class
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
                  <TextField
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Name"
                    defaultValue={classData && classData.name}
                    error={errors.name}
                    inputRef={register({
                      required: "Please enter a name",
                    })}
                  />
                  <TextField
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Description"
                    defaultValue={classData && classData.description}
                    error={errors.description}
                    inputRef={register}
                  />
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

export default EditClassModal;