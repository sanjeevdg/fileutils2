import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <NavLink to="/">
        Home
      </NavLink>

      <NavLink to="/file-reader">
        File Reader
      </NavLink>

<NavLink to="/userformrenderer">
       User Form Renderer
      </NavLink>

<NavLink to="/loginrenderer">
        Login Renderer
      </NavLink>

<NavLink to="/dashboard">
        Dashboard 
      </NavLink>

<NavLink to="/master-detail">
        Master/Detail 
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