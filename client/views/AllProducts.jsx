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
import AddProduct from "./AddProduct"
import Card from "../shared/bootstrapdash/Card/Card";
import Autocomplete from "react-autocomplete"
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  FormLabel,
  FormControl
} from "react-bootstrap";
import {get,post} from '../api.jsx'
import add from '../assets/icons/add.svg';
import shirt from '../assets/icons/shirt.svg';

class AllProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      items: [],
      shown: []
    };
  }
  componentDidMount(){
    get('/api/campaigns').then( res => {
      console.log(res)
      console.log("RES")
      if(res.success){
          this.setState({
            items: res.campaigns,
            shown: res.campaigns
          })
      }
    })
  }
  onChange(e){
    this.setState({value:e.target.value})
    const value = e.target.value

    var shown = []
    for(var i = 0; i < this.state.items.length; i++){
      const item = this.state.items[i]
      if(item.product_title.toLowerCase().indexOf(value.toLowerCase()) > -1){
        shown.push(item)
      }
    }
    this.setState({shown:shown})
  }

  onSelect(e){
    this.setState({value: e})
    const value = e

    var shown = []
    for(var i = 0; i < this.state.items.length; i++){
      const item = this.state.items[i]
      if(item.product_title.toLowerCase().indexOf(value.toLowerCase()) > -1){
        shown.push(item)
      }
    }
    this.setState({shown:shown})
  }

  render() {
    const items = this.state.items
    const shown = this.state.shown
    const value = this.state.value
    console.log(shown)
    return (
      <div className="content">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Products Currently Optimizing"
                ctAllIcons
                category={
                  <span>
                    Here are all the products that we are price optimizing for you!
                  </span>
                }
                content={
                  <>
                  <Row>
                      <div className="col-md-5">
                        <Autocomplete
                          getItemValue={(item) => item.id}
                          items={items}
                          shouldItemRender={(item, value) => item.title.toLowerCase().indexOf(value.toLowerCase()) > -1}
                          renderItem={(item, isHighlighted) =>
                            <div style={{ background: isHighlighted ? 'lightgray' : 'white'}}>
                              {item.title}
                            </div>
                          }
                          menuStyle={{
                            borderRadius: '5px',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '2px 0',
                            fontSize: '90%',
                            position: 'fixed',
                            overflow: 'auto',
                            maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
                            zIndex: '998',
                            }}
                          renderInput = {(props) => {
                            return(
                              <FormGroup>
                                <FormLabel>Add Product</FormLabel>
                                <FormControl {...props} type= "text" bsClass= "form-control" placeholder="Enter a product id" value={value}/>
                              </FormGroup>
                            )
                          }}
                          value={value}
                          onChange={(e) => this.onChange(e)}
                          onSelect={(val) => this.onSelect(val)}
                        />
                      </div>
                    </Row>
                  <Row>
                    {shown.map((prop, key) => {
                      return (
                        <Col
                          lg={2}
                          md={3}
                          sm={4}
                          xs={6}
                          className="font-icon-list"
                          key={key}
                        >
                        <a href={"/product?id="+ prop.product_id} style={{color:"#64AC8F"}}> 
                          <div className="font-icon-detail">
                            <img src={add} className="mb-3"/>
                            <p>{prop.product_title}</p>
                          </div>
                         </a>
                        </Col>
                      );
                    })}
                    <Col
                          lg={2}
                          md={3}
                          sm={4}
                          xs={6}
                          className="font-icon-list"
                          key={items.length+1}
                        >
                        <a href="/addnew" style={{color:"#64AC8F"}}> 
                          <div style={{textAlign: "center",
                              paddingTop: 45,
                              paddingBottom: 30,
                              marginTop: 15}} >
                            <img src={add} className="mb-3"/>
                            <p>New Product</p>
                          </div>
                        </a>
                        </Col>
                  </Row>
                  </>
                }
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default AllProducts;

