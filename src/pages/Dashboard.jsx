import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { getAuthHeaders } from "../utils/auth";
import YamlNavigationLayout from "../layout/YamlNavigationLayout";
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






function validateForm(formData, config) {

    console.log('entered validation methid');

    const errors = {};

    const widgets =
        config?.pages?.dashboard?.widgets ??
        config?.widgets ??
        [];

    // Collect widgets recursively, including container children.
    function collectWidgets(items) {
        const result = [];

        items.forEach((widget) => {
            result.push(widget);

            if (Array.isArray(widget.children)) {
                result.push(...collectWidgets(widget.children));
            }
        });

        return result;
    }

    const allWidgets = collectWidgets(widgets);

    allWidgets.forEach((widget) => {
        const props = widget.props ?? {};
       
        const field = props.field;

        // Only validate actual form fields.
        if (!field) {
            return;
        }

        // Validate fields belonging to the current form entity,
        // when an entity has been specified.
        if (
            props.formEntity &&
            formData?._formEntity &&
            props.formEntity !== formData._formEntity
        ) {
            return;
        }

        const value = formData?.[field];
        const label = props.label || widget.title || field;


        const empty =
            value === null ||
            value === undefined ||
            String(value).trim() === "";

        // Required validation
        if (props.required && empty) {
            errors[field] = `${label} is required`;
            return;
        }

        // Skip other checks for optional empty fields.
        if (empty) {
            return;
        }

        // Email validation
        if (props.type === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(String(value).trim())) {
                errors[field] =
                    "Please enter a valid email address";
                return;
            }
        }

        // Numeric validation
        if (props.numeric) {
            const number = Number(value);

            if (!Number.isFinite(number)) {
                errors[field] = `${label} must be a valid number`;
            }
        }
    });

    console.log("VALIDATION WIDGETS:", allWidgets);
    console.log("VALIDATION ERRORS:", errors);

    // Validate order items in the DetailGrid
    const orderItems = formData?.orderItems ?? [];

    orderItems.forEach((item, index) => {
        const productId = item.product_id;

        if (
            productId === null ||
            productId === undefined ||
            String(productId).trim() === ""
        ) {
            errors[`orderItems.${index}.product_id`] =
                `Product is required for order item ${index + 1}`;
        }
    });
    console.log("VALIDATION ERRORS:", errors);
    return errors;
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


const { name } = useParams();

const [formData, setFormData] = useState({});

const [dataVersion, setDataVersion] = useState(0);

const [cartItems, setCartItems] = useState([]);

const [validationErrors, setValidationErrors] = useState({});


const configName =
    name || "customer_master_detail";
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

const updateField = (field, value) => {

    console.log(
        "UPDATE FIELD:",
        field,
        value
    );

    setFormData(previous => ({
        ...previous,
        [field]: value
    }));
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
            `${API_URL}/api/config?name=${configName}`
            );

    if (!response.ok) {

        throw new Error(
            `Failed to load YAML configuration: ${response.status}`
        );

    }

    const config =
        await response.json();
  //  console.log("LOADED YAML CONFIG KEYS:", Object.keys(config || {}));
  //  console.log("LOADED YAML ENTITIES:", config?.entities);    
    setConfig(config);

    return config;
}


  /*
  =======================================================
  LOAD USERS
  =======================================================
  */

  async function loadUsers() {
    
    const authHeaders = getAuthHeaders();

    if (!authHeaders.Authorization) {
        console.log(
            "Skipping customers request: user is not logged in"
        );
        return;
    }

    const response =
      await fetch(
        `${API_URL}/api/customers`
      , {
            headers: {
                ...getAuthHeaders()
            }
        });


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
    const authHeaders = getAuthHeaders();

    if (!authHeaders.Authorization) {
        console.log(
            "Skipping customers request: user is not logged in"
        );
        return;
    }
    const response =
        await fetch(
            `${API_URL}/api/orders`
        , {
            headers: {
                ...getAuthHeaders()
            }
        });

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


const addToCart = (product) => {
    setCartItems(prev => {
        const existing = prev.find(
            item => String(item.id) === String(product.id)
        );

        if (existing) {
            return prev.map(item =>
                String(item.id) === String(product.id)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        }

        return [
            ...prev,
            {
                ...product,
                quantity: 1
            }
        ];
    });
};

const updateCartQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCartItems(prev =>
        prev.map(item =>
            String(item.id) === String(productId)
                ? { ...item, quantity }
                : item
        )
    );
};

const removeFromCart = (productId) => {
    setCartItems(prev =>
        prev.filter(
            item => String(item.id) !== String(productId)
        )
    );
};

const clearCart = () => {
    setCartItems([]);
};

const selectRecord = async (record, entity) => {
    console.log("SELECTED RECORD:", record);
    console.log("SELECTED ENTITY:", entity);

    const {
        _gridId,
        ...cleanRecord
    } = record;

    // Only orders need their order items loaded.
    if (entity !== "orders") {
        setFormData(cleanRecord);
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/order_items?order_id=${cleanRecord.id}`
        , {
            headers: {
                ...getAuthHeaders()
            }
        });

        if (!response.ok) {
            throw new Error(
                `Failed to load order items: ${response.status}`
            );
        }

        const result = await response.json();

        setFormData({
            ...cleanRecord,
            orderItems: Array.isArray(result)
                ? result
                : []
        });

    } catch (err) {
        console.error("LOAD ORDER ITEMS ERROR:", err);

        setFormData({
            ...cleanRecord,
            orderItems: []
        });
    }
};


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

  }, [configName]);





        useEffect(() => {
            if (
                !formData.product_id ||
                !formData.quantity
            ) {
                return;
            }

            const calculateAmount = async () => {
                try {
                    const response = await fetch(
                        `${API_URL}/api/inventory/${formData.product_id}`
                    , {
                        headers: {
                            ...getAuthHeaders()
                        }
                    });

                    if (!response.ok) {
                        throw new Error(
                            `Failed to load product: ${response.status}`
                        );
                    }

                    const product = await response.json();

                    const quantity =
                        Number(formData.quantity);

                    const price =
                        Number(product.price);

                    if (
                        !Number.isFinite(quantity) ||
                        !Number.isFinite(price)
                    ) {
                        return;
                    }

                    const amount =
                        price * quantity;

                    setFormData(previous => ({
                        ...previous,
                        amount
                    }));

                } catch (err) {
                    console.error(
                        "AMOUNT CALCULATION ERROR:",
                        err
                    );
                }
            };

            calculateAmount();

        }, [formData.product_id, formData.quantity]);






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

  async function selectCustomer(user) {

    try {

      setError(null);


      const response =
        await fetch(
          `${API_URL}/api/customers/${user.id}`
        , {
            headers: {
                ...getAuthHeaders()
            }
        });

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








const signup = async () => {
    setError(null);
    setMessage(null);

    const email = formData.email?.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirm_password;

    if (!email || !password || !confirmPassword) {
        setError("Please complete all fields.");
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "Unable to create your account."
            );
        }

        console.log("SIGNUP SUCCESS:", result);

        alert("Account created successfully! Please log in.");

        setFormData({});
        window.location.hash = "#/dashboard/user_login";

    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        setError(error.message || "Unable to create your account.");
    }
};




















const login = async () => {
    setError(null);
    setMessage(null);

    const email = formData.email?.trim().toLowerCase();
    const password = formData.password;
    const rememberMe = formData.remember_me === true;

    if (!email || !password) {
        setError("Please enter your email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail || "Login failed. Please check your credentials."
            );
        }

        if (!result.access_token || !result.user?.role) {
            throw new Error("The server did not return a valid login response.");
        }

        // Remove any previous login from both storage locations.
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("auth_user");

        // Remember Me selects persistent storage.
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem("access_token", result.access_token);
        storage.setItem("auth_user", JSON.stringify(result.user));

        setMessage("Login successful!");

        if (result.user.role === "admin") {
            window.location.hash = "#/dashboard/admin_dashboard";
        } else if (result.user.role === "user") {
            window.location.hash = "#/dashboard/new_frontend";
        } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("auth_user");
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("auth_user");

            throw new Error("Unrecognized user role.");
        }

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        setError(error.message || "Unable to log in.");
    }
};








const saveInventory = async () => {
   
  console.log("=== SAVE INVENTORY CALLED ===");
    console.log("inventory FORM DATA:", formData);

const errors = validateForm(formData, config);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
        setError("Please correct the highlighted fields.");
        setMessage(null);
        return;
    }

  
    if (!formData || Object.keys(formData).length === 0) {
        setError(
            buttonWidget?.feedback?.error ||
            "Please enter customer data first."
        );
        return;
    }




    try {
        const payload = {
            sku: formData.sku ?? "",
            name: formData.name ?? "",
            description: formData.description ?? "",
            price:
                formData.price === "" ||
                formData.price == null
                    ? null
                    : Number(formData.price),
            stock_quantity:
                formData.stock_quantity === "" ||
                formData.stock_quantity == null
                    ? null
                    : Number(formData.stock_quantity),
            active: formData.active ?? true,
             images: Array.isArray(formData.images)
                    ? formData.images
                    : []
        };

        // Determine whether this is a new or existing record
        const isEdit = formData.id != null;

        const url = isEdit
            ? `${API_URL}/api/inventory/${formData.id}`
            : `${API_URL}/api/inventory`;

        const method = isEdit ? "PUT" : "POST";

        console.log("SAVE INVENTORY:", {
            method,
            url,
            payload
        });

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const result = await response.json();

        console.log("SAVED INVENTORY:", result);

        alert(
            isEdit
                ? "Inventory item updated successfully!"
                : "Inventory item added successfully!"
        );

        // Clear the form for the next operation
        setFormData({
            active: true
        });

        // Refresh the datagrid, if your dashboard uses dataVersion
        setDataVersion(prev => prev + 1);

    } catch (error) {
        console.error("SAVE INVENTORY ERROR:", error);
        alert(`Failed to save inventory: ${error.message}`);
    }
};




async function saveOrder(formData, buttonWidget) {
    
      if (!formData) {
        setError("Please enter order details before saving.");
        setMessage(null);
        return;
    }

    const errors = validateForm(formData, config);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
        setError("Please correct the highlighted fields.");
        setMessage(null);
        return;
    }

    // Extra safeguard: reject a completely empty order.
    const hasOrderData = [
        formData.customer_id,
        formData.status,
        formData.order_date
    ].some(
        value =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
    );

    if (!hasOrderData) {
        setError("Please enter order details before saving.");
        setMessage(null);
        return;
    }

    try {

        setSaving(true);
        setError(null);
        setMessage(null);
        const today = new Date().toISOString().split("T")[0];
        /*
         * Only fields belonging to the orders table.
         */
        //new Date().toISOString().split("T")[0]
        const orderToSave = {
            customer_id: formData.customer_id,
            order_date:formData.order_date,
            status: formData.status
        };

        if (formData?.id != null) {
            orderToSave.id = formData.id;
        }

        console.log(
            "ORDER HEADER TO SAVE:",
            orderToSave
        );

        const isNew =
            orderToSave.id === null ||
            orderToSave.id === undefined;

        const url = isNew
            ? `${API_URL}/api/orders`
            : `${API_URL}/api/orders/${orderToSave.id}`;

        const method = isNew
            ? "POST"
            : "PUT";

        console.log(
            "SAVE URL:",
            url
        );

        console.log(
            "METHOD:",
            method
        );

        const response = await fetch(
            url,
            {
                method,

                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },

                body: JSON.stringify(orderToSave)
            }
        );

        console.log(
            "RESPONSE STATUS:",
            response.status
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Failed to save order: ${response.status} ${errorText}`
            );
        }

        const savedOrder =
            await response.json();

        console.log(
            "ORDER SAVED:",
            savedOrder
        );

            // --------------------------------------------------
            // Save order items
            // --------------------------------------------------

            const orderItems = formData.orderItems || [];

            //
            // If this is an existing order, remove its
            // existing detail rows first.
            //
            if (!isNew) {

                console.log(
                    "DELETING EXISTING ORDER ITEMS FOR ORDER:",
                    savedOrder.id
                );

                const existingItemsResponse =
                    await fetch(
                        `${API_URL}/api/order_items?order_id=${savedOrder.id}`
                    , {
                        headers: {
                            ...getAuthHeaders()
                        }
                    });

                if (!existingItemsResponse.ok) {
                    throw new Error(
                        `Failed to load existing order items: ${existingItemsResponse.status}`
                    );
                }

                const existingItems =
                    await existingItemsResponse.json();

                console.log(
                    "EXISTING ORDER ITEMS:",
                    existingItems
                );

                for (const existingItem of existingItems) {

                    const deleteResponse =
                        await fetch(
                            `${API_URL}/api/order_items/${existingItem.id}`,
                            {
                                method: "DELETE"
                            }, {
                                headers: {
                                    ...getAuthHeaders()
                                }
                            });
                        

                    if (!deleteResponse.ok) {
                        const errorText =
                            await deleteResponse.text();

                        throw new Error(
                            `Failed to delete order item ${existingItem.id}: ${deleteResponse.status} ${errorText}`
                        );
                    }

                    console.log(
                        "DELETED ORDER ITEM:",
                        existingItem.id
                    );
                }
            }

            //
            // Insert the current set of order items.
            //
            for (const item of orderItems) {

                const orderItem = {
                    order_id: savedOrder.id,
                    product_id: item.product_id,
                    quantity: Number(item.quantity),
                    amount: Number(item.amount)
                };

                console.log(
                    "ORDER ITEM TO SAVE:",
                    orderItem
                );

                const itemResponse =
                    await fetch(
                        `${API_URL}/api/order_items`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                 ...getAuthHeaders()
                            },
                            body: JSON.stringify(orderItem)
                        }
                    );

                if (!itemResponse.ok) {
                    const errorText =
                        await itemResponse.text();

                    throw new Error(
                        `Failed to save order item: ${itemResponse.status} ${errorText}`
                    );
                }

                const savedOrderItem =
                    await itemResponse.json();

                console.log(
                    "ORDER ITEM SAVED:",
                    savedOrderItem
                );
            }

        setSelectedOrder(null);

        setMessage(
            "Order saved successfully."
        );

        await loadOrders();

    } catch (err) {

        console.error(
            "SAVE ORDER ERROR:",
            err
        );

        setError(err.message);

    } finally {

        setSaving(false);
    }
}

function resetCustomerForm() {
    setFormData({
        first_name: "",
        last_name: "",
        email: "",
        age: "",
        gender: "",
        city: "",
        active: true
    });
} 


async function saveCustomer(buttonWidget) {

     const errors = validateForm(formData, config);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
        setError("Please correct the highlighted fields.");
        setMessage(null);
        return;
    }

    console.log("THE SAVE BUTTONWIDGET FUNCTION CALLED");
    console.log("=== SAVE CALLED ===");
    console.log("FORM DATA:", formData);

    if (!formData || Object.keys(formData).length === 0) {
        setError(
            buttonWidget?.feedback?.error ||
            "Please enter customer data first."
        );
        return;
    }




    try {

        setSaving(true);
        setError(null);
        setMessage(null);

        console.log("FORM ID:", formData.id);
        console.log("FORM DATA KEYS:", Object.keys(formData));

        const isNew =
            formData.id === null ||
            formData.id === undefined ||
            formData.id === "";

        const url = isNew
            ? `${API_URL}/api/customers`
            : `${API_URL}/api/customers/${formData.id}`;

        const method = isNew
            ? "POST"
            : "PUT";

        
        


        console.log("SAVE MODE:", isNew ? "CREATE" : "EDIT");
        console.log("SAVE URL:", url);
        console.log("METHOD:", method);

        const response = await fetch(
            url,
            {
                method,

                headers: {
                    "Content-Type": "application/json",
                     ...getAuthHeaders()
                },

                body: JSON.stringify(formData)
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Failed to save customer: ${response.status} ${errorText}`
            );
        }

        const savedCustomer =
            await response.json();

        console.log(
            "CUSTOMER SAVED:",
            savedCustomer
        );
        const successMessage =
            buttonWidget?.feedback?.success ||
            (
                isNew
                    ? "Customer created successfully."
                    : "Customer updated successfully."
            );
        setMessage(successMessage);

        /*
         * Refresh DataGrid
         */
        setDataVersion(
            previous => previous + 1
        );

        /*
         * Keep the saved record
         * in the form.
         */
        /*
 * Reset form after successful create or edit
 */
resetCustomerForm();

//        setFormData(savedCustomer
    //    );

    }
    catch (err) {

        console.error(
            "SAVE CUSTOMER ERROR:",
            err
        );
        const errorMessage =
            buttonWidget?.feedback?.error ||
            "Failed to save customer.";  
        setError(errorMessage);

    }
    finally {

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

async function save() {


    console.log('THIS SAVE FUNCTION CALLED');


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

        console.log("FORM ID22222222:", formData.id);
        console.log("FORM DATA KEYS22222222222:", Object.keys(formData));

        const isNew =
            formData.id === null ||
            formData.id === undefined ||
            formData.id === "";


        /*
        =====================================================
        CUSTOMER PAYLOAD
        =====================================================

        selectedUser may contain UI-only properties such as
        orderItems.

        Only send fields that belong to the customers entity.
        */

        const customerPayload = {
            id: selectedUser.id,
            first_name: selectedUser.first_name,
            last_name: selectedUser.last_name,
            email: selectedUser.email,
            age: selectedUser.age,
            gender: selectedUser.gender,
            city: selectedUser.city,
            active: selectedUser.active
        };


        /*
        =====================================================
        NEW CUSTOMER
        =====================================================
        */

        if (isNew) {

            /*
             * Don't send id when creating a new record.
             */

            delete customerPayload.id;


            const response =
                await fetch(
                    `${API_URL}/api/customers`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                                 ...getAuthHeaders()
                        },

                        body:
                            JSON.stringify(
                                customerPayload
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
                             ...getAuthHeaders()
                    },

                    body:
                        JSON.stringify(
                            customerPayload
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

    if (!formData?.id) {
      setError("Please select a customer first.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${formData.first_name} ${formData.last_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setMessage(null);

      const deletedId = formData.id;

      const response = await fetch(
        `${API_URL}/api/customers/${deletedId}`,
        {
          method: "DELETE",
        }, {
            headers: {
                ...getAuthHeaders()
            }
        });

      if (!response.ok) {
        throw new Error(
          `Failed to delete customer: ${response.status}`
        );
      }

      // Remove the deleted customer from the customer list.
      const remaining = users.filter(
        user => user.id !== deletedId
      );

      setUsers(remaining);

      setSelectedUser(remaining.length > 0 ? remaining[0] : null);
      setDataVersion(previous => previous + 1);
      resetCustomerForm();
      setMessage("Customer deleted successfully.");

    } catch (err) {
      console.error(err);
      setError(err.message);
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
    formData,
    dataVersion,
    validationErrors,
    cartItems,
    cartCount: cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    ),
    cartTotal: cartItems.reduce(
        (total, item) =>
            total + Number(item.price || 0) * item.quantity,
        0
    ),
};
console.log("DASHBOARD FORM DATA:", formData);
  console.log(
      "RENDER CONTEXT:",
      context
  );

  /*
  =======================================================
  HANDLERS AVAILABLE TO YAML
  =======================================================
  

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

};*/
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

   // newCustomer,

    newOrder,

    selectOrder,

    handleBindingChange,

    deleteCustomer,

    updateField,

    updateOrderField,

    saveOrder,
    saveCustomer,
    selectRecord,
    saveInventory,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    login,
    signup

  };

//saveCustomer,
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
            <YamlNavigationLayout config={config}>
            <PageRenderer
                config={config}
                pageName="dashboard"
                context={context}
                handlers={handlers}
            />
            </YamlNavigationLayout>
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