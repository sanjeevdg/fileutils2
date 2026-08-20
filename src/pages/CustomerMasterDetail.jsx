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
FORM RENDERER
=========================================================
*/

function FormRenderer({
  node,
  context,
  handlers,
}) {

  if (!node) {
    return null;
  }


  const {
    type,
    props = {},
    children = [],
    text,
    field,
    binding,
    dataSource,
    events = {},
    options = [],
  } = node;


  /*
  -------------------------------------------------------
  Resolve events
  -------------------------------------------------------
  */

  const eventProps = {};


  Object.entries(events).forEach(
    ([eventName, handlerName]) => {

      if (
        handlers[handlerName]
      ) {

        eventProps[eventName] =
          handlers[handlerName];

      }

    }
  );


  /*
  =======================================================
  TABLE BODY
  =======================================================
  */

  if (type === "tableBody") {

    const rows =
      context[dataSource] || [];


    return (
      <TableBody>

        {rows.map(
          (row, index) => (

            <FormRenderer
              key={
                row.id ?? index
              }

              node={
                children[0]
              }

              context={{
                ...context,
                row,
              }}

              handlers={
                handlers
              }
            />

          )
        )}

      </TableBody>
    );
  }


  /*
  =======================================================
  TABLE ROW
  =======================================================
  */

  if (type === "tableRow") {

    const row = context.row;

    const rowEventProps = {};

    Object.entries(events).forEach(
        ([eventName, handlerName]) => {

            if (handlers[handlerName]) {

                rowEventProps[eventName] =
                    (event) => {

                        handlers[handlerName](
                            event,
                            row
                        );

                    };
            }
        }
    );

    return (
        <TableRow
            {...props}
            {...rowEventProps}
        >

            {children.map(
                (child, index) => (

                    <FormRenderer
                        key={
                            child.id ?? index
                        }
                        node={child}
                        context={context}
                        handlers={handlers}
                    />

                )
            )}

        </TableRow>
    );
}

  /*
  =======================================================
  TABLE CELL
  =======================================================
  */

  if (type === "tableCell") {

    const cellValue =
      field
        ? getValue(
            context.row,
            field
          )
        : text;


    return (
      <TableCell>

        {
          typeof cellValue ===
          "boolean"

            ? cellValue
              ? "Yes"
              : "No"

            : cellValue
        }

      </TableCell>
    );
  }


  /*
  =======================================================
  TEXT FIELD
  =======================================================
  */

  if (type === "textfield") {

    const value = binding
        ? getValue(context, binding)
        : "";

    return (
        <TextField
            label={props.label}
            name={props.name}
            type={props.type || "text"}
            fullWidth={props.fullWidth}
            disabled={props.disabled}
            size={props.size}
            sx={props.sx}

            value={
                value === null ||
                value === undefined
                    ? ""
                    : String(value)
            }

            onChange={(event) => {

                if (
                    handlers.handleBindingChange &&
                    binding
                ) {

                    handlers.handleBindingChange(
                        binding,
                        event.target.value
                    );

                }

            }}
        />
    );
}
  /*
  =======================================================
  SELECT
  =======================================================
  */

  if (type === "select") {

    const value = binding
        ? getValue(context, binding)
        : "";

    return (
        <FormControl
            fullWidth
            sx={props.sx}
        >

            <InputLabel>
                {props.label}
            </InputLabel>

            <Select
                label={props.label}
                name={props.name}

                value={
                    value === null ||
                    value === undefined
                        ? ""
                        : value
                }

                onChange={(event) => {

                    if (
                        handlers.handleBindingChange &&
                        binding
                    ) {

                        handlers.handleBindingChange(
                            binding,
                            event.target.value
                        );
                    }

                }}
            >

                {options.map(
                    (option, index) => {

                        const label =
                            typeof option === "string"
                                ? option
                                : option.label;

                        const optionValue =
                            typeof option === "string"
                                ? option
                                : option.value;

                        return (
                            <MenuItem
                                key={
                                    optionValue ??
                                    index
                                }
                                value={optionValue}
                            >
                                {label}
                            </MenuItem>
                        );
                    }
                )}

            </Select>

        </FormControl>
    );
}

  /*
  =======================================================
  CHECKBOX
  =======================================================
  */

  if (type === "checkbox") {

    const value = binding
        ? getValue(context, binding)
        : false;

    return (
        <FormControlLabel

            label={props.label}

            control={
                <Checkbox
                    name={props.name}

                    checked={
                        Boolean(value)
                    }

                    onChange={(event) => {

                        if (
                            handlers.handleBindingChange &&
                            binding
                        ) {

                            handlers.handleBindingChange(
                                binding,
                                event.target.checked
                            );
                        }

                    }}
                />
            }

        />
    );
}

  /*
  =======================================================
  NORMAL MUI COMPONENT
  =======================================================
  */

  const Component =
    componentMap[type];


  if (!Component) {

    console.warn(
      `Unknown component type: ${type}`
    );

    return null;
  }


  return (
    <Component
      {...props}
      {...eventProps}
    >

      {text}

      {children.map(
        (child, index) => (

          <FormRenderer
            key={
              child.id ?? index
            }

            node={
              child
            }

            context={
              context
            }

            handlers={
              handlers
            }

          />

        )
      )}

    </Component>
  );
}


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
        `${API_URL}/api/users`
      );


    if (!response.ok) {

      throw new Error(
        `Failed to load users: ${response.status}`
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
          `${API_URL}/api/users/${user.id}`
        );


      if (!response.ok) {

        throw new Error(
          `Failed to load user: ${response.status}`
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


  /*
  =======================================================
  CHANGE DETAIL FIELD
  =======================================================
  */

function handleBindingChange(binding, value) {

    if (!binding.startsWith("selectedUser.")) {
        return;
    }

    const fieldName = binding.substring(
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

        // Keep master list in sync
        setUsers(previousUsers =>
            previousUsers.map(user =>
                user.id === updatedUser.id
                    ? updatedUser
                    : user
            )
        );

        return updatedUser;
    });
}
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


      const response =
        await fetch(
          `${API_URL}/api/users/${selectedUser.id}`,
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

        throw new Error(
          `Failed to save user: ${response.status}`
        );

      }


      const updated =
        await response.json();


      /*
       * Update master list
       */

      setUsers(
        previous =>
          previous.map(
            user =>
              user.id ===
              updated.id
                ? updated
                : user
          )
      );


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
          `${API_URL}/api/users/${selectedUser.id}`,
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

    users:
      filteredUsers,

    selectedUser,

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

  const handlers = {

    handleSearch,

    selectCustomer,

    handleBindingChange,

    saveCustomer,

    deleteCustomer,

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


  /*
  =======================================================
  RENDER YAML
  =======================================================
  */

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
        <FormRenderer
          node={
            config.page
          }

          context={
            context
          }

          handlers={
            handlers
          }
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
}