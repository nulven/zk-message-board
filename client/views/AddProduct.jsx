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
// import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  FormLabel,
  FormControl
} from "react-bootstrap";
import { Card } from "../shared/bootstrapdash/Card/Card.jsx";
import { FormInputs } from "../shared/bootstrapdash/FormInputs/FormInputs.jsx";
import { UserCard } from "../shared/bootstrapdash/UserCard/UserCard.jsx";
import Button from "../shared/bootstrapdash/CustomButton/CustomButton.jsx";
import Autocomplete from "react-autocomplete"
import Slider, { Range, createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
import {get,post,put} from '../api.jsx'
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import {Modal} from 'react-bootstrap'
const SliderWithTooltip = createSliderWithTooltip(Slider);


const AddProduct = (props) => {
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [inputs, setInputs] = useState({
    value: "",
    minPrice: "",
    maxPrice:"",
    aggression:"",
  })

  useEffect(() => {
    get('/api/products').then( res => {
      if(res.success){
          setItems(res.products)
      }
    })
  },[])

  const handleSubmit = (override=false) => {
    var validItem = false
    let productInfo;
    for(var i=0;i<items.length;i++){
      if(items[i].title == inputs.value){
        validItem = true
        productInfo = items[i]
        break;
      }
    }
    if(!validItem){
      toast.error("Enter a valid product ID");
      return
    }
    if(isNaN(parseInt(inputs.minPrice)) || isNaN(parseInt(inputs.maxPrice))){
      toast.error("Min/max price is not a number");
      return
    }
    if(parseInt(inputs.minPrice) > parseInt(inputs.maxPrice)){
      toast.error("Max price must be larger than min price");
      return
    }
    console.log("success")
    const campaign = {
      title: inputs.value,
      min_price: parseInt(inputs.minPrice),
      max_price: parseInt(inputs.maxPrice),
    }
    console.log(campaign)
    if(!override){
      post("/api/products/"+productInfo.id+"/campaigns",campaign).then( response =>{
        if(response.ok !==undefined  && !response.ok){
          setShow(true)
        } else{
          props.history.push('/product?id='+productInfo.id)
        }
      }).catch(err => {
         console.log(err)
      })
    } else{
      put("/api/products/"+productInfo.id+"/campaigns",campaign).then( response =>{
        if(response.ok !==undefined  && !response.ok){
          setShow(true)
        } else{
          props.history.push('/product?id='+productInfo.id)
        }
      }).catch(err => {
         console.log(err)
      })
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  }

    return (
      <div className="content">
        <Container fluid>
          <ToastContainer/>
          <Modal
            show={show}
            onHide={() => setShow(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                A Campaign for that Product already exists
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Do you want to create a new campaign for this product?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button fill onClick={() => setShow(false)}>Cancel</Button>
              <Button fill onClick={() => handleSubmit(true)}>Continue</Button>
            </Modal.Footer>
          </Modal>
          <Row>
            <Col>
              <Card
                title="New Campaign"
                content={
                  <form onSubmit={handleSubmit}>
                    <Row>
                      <div className="col-md-5">
                        <Autocomplete
                          getItemValue={(item) => item.title}
                          items={items}
                          shouldItemRender={(item, value) => item.title.toLowerCase().indexOf(value.toLowerCase()) > -1}
                          renderItem={(item, isHighlighted) =>
                            <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white'}}>
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
                          renderInput = {(x) => {
                            return(
                              <FormGroup>
                                <FormLabel>Add Product</FormLabel>
                                <FormControl {...x} type= "text" bsClass= "form-control" placeholder="Enter a product id" value={inputs.value}/>
                              </FormGroup>
                            )
                          }}
                          value={inputs.value}
                          onChange={(e) => setInputs({...inputs, "value": e.target.value})}
                          onSelect={(val) => setInputs({...inputs, "value": val})}
                        />
                      </div>
                    </Row>
                    <FormGroup>
                      <Row>
                        <Col>
                          <FormLabel>Min Price</FormLabel>
                          <FormControl {...props} name="minPrice" type= "number" bsClass="form-control" placeholder="Enter a price" min={0} value={inputs.minPrice} onChange={handleOnChange}/>
                        </Col>
                        </Row>
                        <Row>
                        <Col>
                          <FormLabel className="mt-4">Max Price</FormLabel>
                          <FormControl {...props} name="maxPrice" type= "number" bsClass="form-control" placeholder="Enter a price" min={0} value={inputs.maxPrice}  onChange={handleOnChange}/>
                        </Col>
                      </Row>
                    <Row>
                        <Col md={6}>
                      <FormLabel className="mt-3">Aggression</FormLabel>
                      <div className="pl-1 pr-2">
                      <SliderWithTooltip handleStyle={{
                          backgroundColor: "#94D6BA",
                          border: 2,
                          borderColor: "#94D6BA"
                        }}
                        tipProps={{placement:"bottom"}}
                        trackStyle={{backgroundColor: "#C0DFC2",borderColor: "#94D6BA"}}
                        onAfterChange={(val) => setInputs({...inputs,aggression: val})}
                        className="mb-5 mt-3 ml-2 mr-5" range min={0} max={100} value={inputs.aggression} 
                        onChange={(val) => setInputs({...inputs,aggression: val})}/>
                      </div>
                        </Col>
                    </Row>
                    </FormGroup>
                    <Button bsStyle="info" pullRight fill onClick={() => handleSubmit(false)}>
                      Start Optimizing
                    </Button>
                    <div className="clearfix" />
                  </form>
                }
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

export default AddProduct;


