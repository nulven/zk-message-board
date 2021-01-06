/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from "./views/Dashboard.jsx";
import UserProfile from "./views/UserProfile.jsx";
import TableList from "./views/TableList.jsx";
import Typography from "./views/Typography.jsx";
import Icons from "./views/Icons.jsx";
import Maps from "./views/Maps.jsx";
import Notifications from "./views/Notifications.jsx";
import Upgrade from "./views/Upgrade.jsx";
import AddProduct from "./views/AddProduct.jsx";
import AllProducts from "./views/AllProducts.jsx";
import Product from "./views/Product.jsx";
import { iconsArray } from "./variables/Variables.jsx";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard,
    products: iconsArray,
    layout: "/admin",
    show: true
  },
];

export default dashboardRoutes;
