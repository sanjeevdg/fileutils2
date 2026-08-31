import React, { useEffect, useState } from "react";

import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from "@mui/material";

import PageRenderer from './PageRenderer';
import FormRenderer from './FormRenderer';
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


/*
=========================================================
MUI COMPONENT MAP
=========================================================
*/

const componentMap = {

  container: Container,
  box: Box,
  grid: Grid,
  paper: Paper,
  typography: Typography,
  textfield: TextField,
  button: Button,
  select: Select,
  table: Table,
  tableHead: TableHead,
  tableBody: TableBody,
  tableRow: TableRow,
  tableCell: TableCell,

};


/*
=========================================================
GET VALUE FROM OBJECT USING PATH
=========================================================
*/

function getValue(object, path) {

  if (!object || !path) {
    return undefined;
  }

  return path
    .split(".")
    .reduce(
      (value, key) => value?.[key],
      object
    );
}

function setValue(object, path, value) {

    const keys = path.split(".");

    const result = {
        ...object
    };

    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {

        const key = keys[i];

        current[key] = {
            ...(current[key] || {})
        };

        current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    return result;
}
/*
=========================================================
SET VALUE USING PATH
=========================================================


function getValue(object, path) {

    if (!object || !path) {
        return undefined;
    }

    return path
        .split(".")
        .reduce(
            (value, key) => value?.[key],
            object
        );
}
*/




/*
=========================================================
USER MASTER / DETAIL
=========================================================
*/

export default function CustomerMasterDetail() {




  /*
  -------------------------------------------------------
  YAML configuration
  -------------------------------------------------------
  */

  const [
    config,
    setConfig,
  ] = useState(null);


  /*
  -------------------------------------------------------
  Users
  -------------------------------------------------------
  */

  const [
    users,
    setUsers,
  ] = useState([]);


  /*
  -------------------------------------------------------
  Selected user
  -------------------------------------------------------
  */

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

const [
    selectedOrder,
    setSelectedOrder,
] = useState(null);

const [
    orders,
    setOrders,
] = useState([]);

const updateField = (
    binding,
    fieldName,
    value
) => {

    console.log(
        "UPDATE FIELD:",
        binding,
        fieldName,
        value
    );

    if (binding !== "selectedUser") {
        return;
    }

    setSelectedUser(previous => {

        if (!previous) {
            return previous;
        }

        const updatedUser = {
            ...previous,
            [fieldName]: value
        };

        console.log(
            "UPDATED USER:",
            updatedUser
        );

        setUsers(previousUsers =>
            previousUsers.map(user =>
                user.id === updatedUser.id
                    ? updatedUser
                    : user
            )
        );

        return updatedUser;
    });
};
  /*
  -------------------------------------------------------
  Search
  -------------------------------------------------------
  */

  const [
    search,
    setSearch,
  ] = useState("");


  /*
  -------------------------------------------------------
  Loading
  -------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
  -------------------------------------------------------
  Saving
  -------------------------------------------------------
  */

  const [
    saving,
    setSaving,
  ] = useState(false);


  /*
  -------------------------------------------------------
  Error
  -------------------------------------------------------
  */

  const [
    error,
    setError,
  ] = useState(null);


  /*
  -------------------------------------------------------
  Message
  -------------------------------------------------------
  */

  const [
    message,
    setMessage,
  ] = useState(null);


  /*
  =======================================================
  LOAD YAML
  =======================================================
  */

  async function loadYaml() {

    const response =
      await fetch(
        `${API_URL}/api/config?name=customer_master_detail`
      );


    if (!response.ok) {

      throw new Error(
        `Failed to load YAML configuration: ${response.status}`
      );

    }


    const config =
      await response.json();


    setConfig(config);

    return config;
  }


  /*
  =======================================================
  LOAD USERS
  =======================================================
  */

  async function loadUsers() {

    const response =
      await fetch(
        `${API_URL}/api/customers`
      );


    if (!response.ok) {

      throw new Error(
        `Failed to load customers: ${response.status}`
      );

    }


    const data =
      await response.json();


    setUsers(data);


    /*
     * Select first user
     */

    if (
      data.length > 0
    ) {

      setSelectedUser(
        data[0]
      );

    }
  }

async function loadOrders() {

    const response =
        await fetch(
            `${API_URL}/api/orders`
        );

    if (!response.ok) {

        throw new Error(
            `Failed to load orders: ${response.status}`
        );

    }

    const data =
        await response.json();

    setOrders(data);
}


async function selectUser(event, user) {

    console.log("Selected user:", user);

    setError(null);

    setSelectedUser(user);
}

  /*
  =======================================================
  INITIALIZE
  =======================================================
  */

  useEffect(() => {

    async function initialize() {

      try {

        setLoading(true);

        setError(null);


        await loadYaml();

        await loadUsers();
        await loadOrders();

      }
      catch (err) {

        console.error(err);

        setError(
          err.message
        );

      }
      finally {

        setLoading(false);

      }

    }


    initialize();

  }, []);


  /*
  =======================================================
  SEARCH
  =======================================================
  */

  function handleSearch(event) {

    setSearch(
      event.target.value
    );

  }


  /*
  =======================================================
  SELECT USER
  =======================================================
  */

  async function selectCustomer(
    event,
    user
  ) {

    try {

      setError(null);


      const response =
        await fetch(
          `${API_URL}/api/customers/${user.id}`
        );

          console.log("Selected:", response);

      if (!response.ok) {

        throw new Error(
          `Failed to load customer: ${response.status}`
        );

      }


      const data =
        await response.json();


      setSelectedUser(
        data
      );

    }
    catch (err) {

      console.error(err);

      setError(
        err.message
      );

    }
  }

async function saveOrder(formData) {

    console.log("=== SAVE ORDER CALLED ===");
    console.log("FORM DATA RECEIVED:", formData);
    console.log("SELECTED ORDER:", selectedOrder);

    if (!formData) {
        setError("No order data received.");
        return;
    }

    try {

        setSaving(true);
        setError(null);
        setMessage(null);

        const orderToSave = {
            ...formData,

            // Preserve the ID when editing.
            // New orders will have no ID.
            ...(selectedOrder?.id != null
                ? { id: selectedOrder.id }
                : {})
        };

        console.log("ORDER TO SAVE:", orderToSave);

        const isNew =
            orderToSave.id === null ||
            orderToSave.id === undefined;

        const url = isNew
            ? `${API_URL}/api/orders`
            : `${API_URL}/api/orders/${orderToSave.id}`;

        console.log("SAVE URL:", url);
        console.log("METHOD:", isNew ? "POST" : "PUT");

        const response = await fetch(
            url,
            {
                method: isNew ? "POST" : "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(orderToSave)
            }
        );

        console.log("RESPONSE STATUS:", response.status);

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                `Failed to save order: ${response.status} ${errorText}`
            );
        }

        const savedOrder = await response.json();

        console.log("ORDER SAVED:", savedOrder);

        setSelectedOrder(null);

        setMessage("Order saved successfully.");

        await loadOrders();

    } catch (err) {

        console.error("SAVE ORDER ERROR:", err);

        setError(err.message);

    } finally {

        setSaving(false);
    }
}
  /*
  =======================================================
  CHANGE DETAIL FIELD
  =======================================================
  */

const handleBindingChange = (
    binding,
    value
) => {

    console.log(
        "BINDING CHANGE:",
        binding,
        value
    );

    if (!binding.startsWith("selectedUser.")) {
        return;
    }

    const fieldName =
        binding.substring(
            "selectedUser.".length
        );

    setSelectedUser(previous => {

        if (!previous) {
            return previous;
        }

        const updatedUser = {
            ...previous,
            [fieldName]: value
        };

        setUsers(previousUsers =>
            previousUsers.map(user =>
                user.id === updatedUser.id
                    ? updatedUser
                    : user
            )
        );

        return updatedUser;
    });
};
  /*
  =======================================================
  SAVE USER
  =======================================================
  */

  async function saveCustomer() {

    if (!selectedUser) {

        setError(
            "Please select a user first."
        );

        return;
    }

    try {

        setSaving(true);
        setError(null);
        setMessage(null);

        const isNew =
            selectedUser.id === null ||
            selectedUser.id === undefined;


        /*
        =====================================================
        NEW CUSTOMER
        =====================================================
        */

        if (isNew) {

            const response =
                await fetch(
                    `${API_URL}/api/customers`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                selectedUser
                            ),
                    }
                );


            if (!response.ok) {

                const errorData =
                    await response.json()
                        .catch(() => null);

                throw new Error(
                    errorData?.detail
                        ? JSON.stringify(
                            errorData.detail
                        )
                        : `Failed to create user: ${response.status}`
                );
            }


            const created =
                await response.json();


            /*
            * Add new customer to master list
            */

            setUsers(
                previousUsers => [
                    ...previousUsers,
                    created
                ]
            );


            /*
            * Select newly created customer
            */

            setSelectedUser(
                created
            );


            setMessage(
                "User created successfully."
            );

            return;
        }


        /*
        =====================================================
        EXISTING CUSTOMER
        =====================================================
        */

        const response =
            await fetch(
                `${API_URL}/api/customers/${selectedUser.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(
                            selectedUser
                        ),
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => null);

            throw new Error(
                errorData?.detail
                    ? JSON.stringify(
                        errorData.detail
                    )
                    : `Failed to save user: ${response.status}`
            );
        }


        const updated =
            await response.json();


        /*
        * Update master list
        */

        setUsers(
            previousUsers =>
                previousUsers.map(
                    user =>
                        user.id === updated.id
                            ? updated
                            : user
                )
        );


        /*
        * Keep detail synchronized
        */

        setSelectedUser(
            updated
        );


        setMessage(
            "User saved successfully."
        );

    }
    catch (err) {

        console.error(err);

        setError(
            err.message
        );

    }
    finally {

        setSaving(false);
    }
}

  /*
  =======================================================
  DELETE USER
  =======================================================
  */

  async function deleteCustomer() {

    if (!selectedUser) {

      setError(
        "Please select a user first."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Delete ${selectedUser.first_name} ${selectedUser.last_name}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setError(null);

      setMessage(null);


      const response =
        await fetch(
          `${API_URL}/api/customers/${selectedUser.id}`,
          {
            method: "DELETE",
          }
        );


      if (!response.ok) {

        throw new Error(
          `Failed to delete user: ${response.status}`
        );

      }


      const deletedId =
        selectedUser.id;


      const remaining =
        users.filter(
          user =>
            user.id !==
            deletedId
        );


      setUsers(
        remaining
      );


      setSelectedUser(
        remaining.length > 0
          ? remaining[0]
          : null
      );


      setMessage(
        "User deleted successfully."
      );

    }
    catch (err) {

      console.error(err);

      setError(
        err.message
      );

    }

  }

async function selectOrder(
    event,
    order
) {

    console.log(
        "Selected order:",
        order
    );

    setError(null);

    setSelectedOrder(
        order
    );
}
  /*
  =======================================================
  FILTER USERS
  =======================================================
  */

  const filteredUsers =
    users.filter(
      user => {

        const searchText =
          search
            .toLowerCase()
            .trim();


        if (!searchText) {
          return true;
        }


        return (

          String(
            user.first_name ||
            ""
          )
            .toLowerCase()
            .includes(
              searchText
            )

          ||

          String(
            user.last_name ||
            ""
          )
            .toLowerCase()
            .includes(
              searchText
            )

          ||

          String(
            user.email ||
            ""
          )
            .toLowerCase()
            .includes(
              searchText
            )

        );

      }
    );


  /*
  =======================================================
  YAML CONTEXT
  =======================================================
  */

const context = {
    config,
    customers: filteredUsers,
    orders,
    selectedUser,
    selectedOrder,
    search,
};
  console.log(
      "RENDER CONTEXT:",
      context
  );

  /*
  =======================================================
  HANDLERS AVAILABLE TO YAML
  =======================================================
  */

const newCustomer = () => {

    setSelectedUser({
        first_name: "",
        last_name: "",
        email: "",
        age: "",
        gender: "",
        city: "",
        active: true
    });

};
function updateOrderField(fieldName, value) {

    setSelectedOrder(previous => {

        if (!previous) {
            return previous;
        }

        return {
            ...previous,
            [fieldName]: value
        };
    });
}
const newOrder = () => {

    console.log("NEW ORDER CLICKED");
    console.log("CURRENT CUSTOMER:", selectedUser);

    if (!selectedUser) {

        setError(
            "Please select a customer first."
        );

        return;
    }

    const order = {
        id: null,
        customer_id: selectedUser.id,
        order_date: new Date()
            .toISOString()
            .split("T")[0],
        product: "",
        quantity: 1,
        amount: 0,
        status: "draft"
    };

    console.log("NEW ORDER:", order);

    setSelectedOrder(order);
};


  const handlers = {

        handleSearch,

    selectCustomer,

    newCustomer,

    newOrder,

    selectOrder,

    handleBindingChange,

    saveCustomer,

    deleteCustomer,

    updateField,

    updateOrderField,

    saveOrder

  };


  /*
  =======================================================
  LOADING
  =======================================================
  */

  if (loading) {

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          minHeight:
            "50vh",
        }}
      >

        <CircularProgress />

      </Box>
    );

  }


  /*
  =======================================================
  ERROR
  =======================================================
  */

  if (error && !config) {

    return (
      <Alert severity="error">
        {error}
      </Alert>
    );

  }

console.log("CONFIG FROM API:", config);
  /*
  =======================================================
  RENDER YAML
  =======================================================
  */
/*
  return (
    <>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}


      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}


      {config && (
     <PageRenderer
    config={config}
    pageName="customer"
    context={context}
    handlers={handlers}
/>
      )}


      {saving && (
        <CircularProgress
          size={24}
          sx={{
            position:
              "fixed",
            bottom: 20,
            right: 20,
          }}
        />
      )}

    </>
  );
*/
console.log("DASHBOARD CONTEXT:", context);
return (
    <>

        {error && (
            <Alert
                severity="error"
                sx={{ mb: 2 }}
            >
                {error}
            </Alert>
        )}

        {message && (
            <Alert
                severity="success"
                sx={{ mb: 2 }}
            >
                {message}
            </Alert>
        )}

        {config && (
            <PageRenderer
                config={config}
                pageName="dashboard"
                context={context}
                handlers={handlers}
            />
        )}

        {saving && (
            <CircularProgress
                size={24}
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                }}
            />
        )}

    </>
);

}