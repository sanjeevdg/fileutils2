//import yaml from "js-yaml";

//const config = yaml.load(yamlText);


export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>Welcome to the application.</p>
      <ul>
        <li><a href="/#/dashboard/user_login">Login</a></li>
        <li><a href="/#/dashboard/user_signup">Signup</a></li>
      </ul>
    </>
  );
}