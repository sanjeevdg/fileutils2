import { NavLink } from "react-router-dom";

export default function Sidebar({isOpen}) {
  return (
    <aside  className={`sidebar ${isOpen ? "open" : "collapsed"}`}>

      <NavLink to="/">
        Home
      </NavLink>
{/** 
      <NavLink to="/file-reader">
        File Reader
      </NavLink>
**/}
<NavLink to="/dashboard/user_signup">
       SignUp
      </NavLink>

<NavLink to="/dashboard/user_login">
        Login
      </NavLink>

      <NavLink to="/dashboard/customer_crud_v1">
        Customers
      </NavLink>
      <NavLink to="/dashboard/inventory_crud_v1">
        Inventory
      </NavLink>
      <NavLink to="/dashboard/orders_crud_v2">
        Orders
      </NavLink>        

<NavLink to="/designer">
        Designer 
      </NavLink>

<NavLink to="/dashboard">
        Dashboard 
      </NavLink>


<NavLink to="/change-password">
        Change Password 
      </NavLink>

      <NavLink to="/about">
        About
      </NavLink>

<NavLink to="/testpicker">
        TestPicker
      </NavLink>
      <NavLink to="/settings">
        Settings
      </NavLink>

    </aside>
  );
}