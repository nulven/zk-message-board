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
import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Navbar, OverlayTrigger, Tooltip } from "react-bootstrap";

import AdminNavbarLinks from "../Navbars/AdminNavbarLinks.jsx";

// import logo from "../../../assets/img/reactlogo.png";
import logo from "../../../assets/logo/PriceRight_Logo.svg";
import home_b from "../../../assets/icons/home_b.svg";
import home from "../../../assets/icons/home.svg";

import cart from "../../../assets/icons/cart.svg";
import cart_b from "../../../assets/icons/cart_b.svg";


class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth
    };
  }
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  updateDimensions() {
    this.setState({ width: window.innerWidth });
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }
  renderTooltip(props) {
    let message = ""
    //Sometimes, props.popper.state is undefined. 
    //It runs this function enough times that state gets a value 
    if (props.popper.state) {
        message = props.popper.state.options.message
    }
    return (
      <Tooltip id="button-tooltip" {...props}>
        {message}
      </Tooltip>
    );
  }

  render() {
    const sidebarBackground = {
      backgroundImage: "url(" + this.props.image + ")"
    };
    return (
      <div
        id="sidebar"
        className="sidebar"
        data-color={"#64AC8F"}
      >
          {this.props.hasImage ? (
            <div className="sidebar-background" style={sidebarBackground} />
          ) : (
            null
          )}
        <div className="logo" style={{height:60}}>
          <a
            href="https://www.creative-tim.com?ref=lbd-sidebar"
            className="simple-text logo-mini"
          >
            <div className="logo-img">
            <img src={logo}/>
            </div>
          </a>
        </div>
        <div className="sidebar-wrapper">
          <Navbar className="flex-column">
            {this.state.width <= 991 ? <AdminNavbarLinks /> : null}
            {this.props.routes.map((prop, key) => {
              console.log(prop.icon)
              if (!prop.redirect && prop.show){
                return (
                    <NavLink
                      to={prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                    <OverlayTrigger
                      placement="right"
                      delay={{ show: 250, hide: 400 }}
                      overlay={this.renderTooltip}
                      popperConfig={{message:prop.name}}
                    >
                     <img src={home_b}/>
                    </OverlayTrigger>
                    </NavLink>
                );
              }
              return null;
            })}
          </Navbar>
        </div>
      </div>
    );
  }
}

export default Sidebar;
