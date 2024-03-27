import {
  useQuery,
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from "react-query";
import supabase from "./supabase";

// React Query client
const client = new QueryClient();

/**** USERS ****/

// Fetch user data
// Note: This is called automatically in `auth.js` and data is merged into `auth.user`
export function useUser(uid) {
  // Manage data fetching with React Query: https://react-query.tanstack.com/overview
  return useQuery(
    // Unique query key: https://react-query.tanstack.com/guides/query-keys
    ["user", { uid }],
    // Query function that fetches data
    () =>
      supabase
        .from("users")
        .select(`*, customers ( * )`)
        .eq("id", uid)
        .single()
        .then(handle),
    // Only call query function if we have a `uid`
    { enabled: !!uid }
  );
}

// Fetch user data (non-hook)
// Useful if you need to fetch data from outside of a component
export function getUser(uid) {
  return supabase
    .from("users")
    .select(`*, customers ( * )`)
    .eq("id", uid)
    .single()
    .then(handle);
}

// Update an existing user
export async function updateUser(uid, data) {
  const response = await supabase
    .from("users")
    .update(data)
    .eq("id", uid)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(["user", { uid }]);
  return response;
}

/**** ITEMS ****/
/* Example query functions (modify to your needs) */

// Fetch item data
export function useItem(id) {
  return useQuery(
    ["item", { id }],
    () => supabase.from("items").select().eq("id", id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all items by owner
export function useItemsByOwner(owner) {
  return useQuery(
    ["items", { owner }],
    () =>
      supabase
        .from("items")
        .select()
        .eq("owner", owner)
        .order("createdAt", { ascending: false })
        .then(handle),
    { enabled: !!owner }
  );
}

// Create a new item
export async function createItem(data) {
  const response = await supabase.from("items").insert([data]).then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(["items"]);
  return response;
}

// Update an item
export async function updateItem(id, data) {
  const response = await supabase
    .from("items")
    .update(data)
    .eq("id", id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(["item", { id }]),
    client.invalidateQueries(["items"]),
  ]);
  return response;
}

// Delete an item
export async function deleteItem(id) {
  const response = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(["item", { id }]),
    client.invalidateQueries(["items"]),
  ]);
  return response;
}

/**** HELPERS ****/

// Get response data or throw error if there is one
function handle(response) {
  if (response.error) throw response.error;
  return response.data;
}

// React Query context provider that wraps our app
export function QueryClientProvider(props) {
  return (
    <QueryClientProviderBase client={client}>
      {props.children}
    </QueryClientProviderBase>
  );
}


// ... existing code ...

/**** CLASSES ****/

// Fetch class data
export function useClass(id) {
  return useQuery(
    ["class", { id }],
    () =>
      supabase.from("classes").select().eq("id", id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all classes by owner
export function useClassesByOwner(owner) {
  return useQuery(
    ["classes", { owner }],
    () =>
      supabase
        .from("classes")
        .select()
        .eq("owner", owner)
        .order("createdAt", { ascending: false })
        .then(handle),
    { enabled: !!owner }
  );
}

// Create a new class
export async function createClass(data) {
  console.log("Creating class with data:", data);
  const response = await supabase.from("classes").insert([data]).then(handle);
  await client.invalidateQueries(["classes"]);
  return response;
}

// Update a class
export async function updateClass(id, data) {
  const response = await supabase
    .from("classes")
    .update(data)
    .eq("id", id)
    .then(handle);
  await Promise.all([
    client.invalidateQueries(["class", { id }]),
    client.invalidateQueries(["classes"]),
  ]);
  return response;
}

// Delete a class
export async function deleteClass(id) {
  const response = await supabase
    .from("classes")
    .delete()
    .eq("id", id)
    .then(handle);
  await Promise.all([
    client.invalidateQueries(["class", { id }]),
    client.invalidateQueries(["classes"]),
  ]);
  return response;
}

export async function createUser(data) {
  const response = await supabase.from("users").insert([data]).then(handle);
  await client.invalidateQueries(["users"]);
  return response;
}

/**** DOCUMENTS ****/

// Fetch document data
export function useDocument(id) {
  return useQuery(
    ["document", { id }],
    () =>
      supabase.from("documents").select().eq("id", id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch documents by class ID
export function useDocumentsByClass(classId) {
  return useQuery(
    ['documents', classId],
    () =>
      supabase
        .from('documents')
        .select()
        .eq('class_id', classId)
        .order('createdAt', { ascending: false })
        .then(handle),
    { enabled: !!classId }
  );
}

// Create a new document
export async function createDocument(classId, data) {
  const fileExt = data.get("file").name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${classId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, data.get("file"));

  if (uploadError) {
    throw uploadError;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData || !userData.user) {
    throw new Error("No authenticated user found");
  }


  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      class_id: classId,
      title: data.get("title"),
      file_path: filePath,
      owner_id: userData.user.id,
    })
    .single();

  if (insertError) {
    throw insertError;
  }

  await client.invalidateQueries(["documents", classId]);
  return document;
}

// Update a document
export async function updateDocument(id, data) {
  const response = await supabase.storage
    .from("documents")
    .update(`${data.get("file").name}`, data.get("file"))
    .eq("id", id)
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }
      return supabase
        .from("documents")
        .update({ title: data.get("title") })
        .eq("id", id);
    })
    .then(handle);
  await Promise.all([
    client.invalidateQueries(["document", { id }]),
    client.invalidateQueries(["documents"]),
  ]);
  return response;
}

// Delete a document
export async function deleteDocument(id) {
  const response = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .then(handle);
  await Promise.all([
    client.invalidateQueries(["document", { id }]),
    client.invalidateQueries(["documents"]),
  ]);
  return response;
}