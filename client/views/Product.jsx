import React, { useState, useEffect } from 'react';
import ChartistGraph from "react-chartist";
import { Container, 
  Row, 
  Col,
  Form,
  FormGroup,
  FormLabel,
  FormControl
} from "react-bootstrap";
import Chartist from "chartist";
import { Card } from "../shared/bootstrapdash/Card/Card.jsx";
import { FormInputs } from "../shared/bootstrapdash/FormInputs/FormInputs.jsx";
import { UserCard } from "../shared/bootstrapdash/UserCard/UserCard.jsx";
import Button from "../shared/bootstrapdash/CustomButton/CustomButton.jsx";
import { StatsCard } from "../shared/bootstrapdash/StatsCard/StatsCard.jsx";
import { Tasks } from "../shared/bootstrapdash/Tasks/Tasks.jsx";
import {
  dataPie,
  legendPie,
  dataSales,
  optionsSales,
  responsiveSales,
  legendSales,
  dataBar,
  optionsBar,
  responsiveBar,
  legendBar
} from "../variables/Variables.jsx";
import {get,post,put,getJsonFromUrl} from '../api.jsx'
import volume from '../assets/icons/volume.svg';
import revenue from '../assets/icons/revenue.svg';
import price from '../assets/icons/price.svg';
import {formatMoney,calculateRevenue,calculateVolume,calculateBestPrice} from "../utils.jsx"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import {Modal} from 'react-bootstrap'
import Slider, { Range, createSliderWithTooltip } from 'rc-slider';
const SliderWithTooltip = createSliderWithTooltip(Slider);
import 'rc-slider/assets/index.css';


const Product = (props) =>{
  const [variants, setVariants] = useState([]);
  const [campaign, setCampaign] = useState({});
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [inputs, setInputs] = useState({
    value: "",
    minPrice: "",
    maxPrice:"",
    aggression:"",
    //add mark for saved aggression
  })
  const [salesData, setSalesData] = useState({
    labels:[],
    series:[]
  })
  const [revenueData, setRevenueData] = useState({
    labels:[],
    series:[]
  })

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  }

  const handleSubmit = (override=false) => {
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
      post("/api/products/"+getJsonFromUrl().id+"/campaigns",campaign).then( response =>{
        if(response.ok !==undefined  && !response.ok){
          setShow(true)
        } else{
          props.history.push('/product?id='+getJsonFromUrl().id)
        }
      }).catch(err => {
         console.log(err)
      })
    } else{
      put("/api/products/"+getJsonFromUrl().id+"/campaigns",campaign).then( response =>{
        if(response.ok !==undefined  && !response.ok){
          setShow(true)
        } else{
          props.history.push('/product?id='+getJsonFromUrl().id)
        }
      }).catch(err => {
         console.log(err)
      })
    }
  }

  const createLegend = (json) => {
    var legend = [];
    for (var i = 0; i < 2; i++) {
      var type = "fa fa-circle text-" + json["types"][i];
      legend.push(
        <div className="pr-5"style={{width:500}}>
          <span class="circle" style={{color: json["types"][i]}}></span> 
          <span>
            <p>{json["names"][i]}</p>
          </span>
        </div>
      );
    }
    return legend;
  }

  useEffect(() => {
    get('/api/products/'+getJsonFromUrl().id+'/campaigns').then( res =>{
      if(res.success){
        console.log(res.campaign)
        setVariants(res.campaign.experiments)
        setCampaign(res.campaign)
        setInputs({...inputs, maxPrice:res.campaign.max_price, minPrice:res.campaign.min_price})
        generateRevenueData(res.campaign.experiments)
        generateSalesData(res.campaign.experiments)
      }
    })
  },[])

  const generateDate = (dateText) => {
      const options = { month:"long", day: 'numeric' };
      const index = new Date(dateText);
      console.log(dateText)
      const date = index.toLocaleDateString(undefined,options).split(" ")
      const label = date[0].slice(0,3) + " " + date[1]
      return label
  }

  const generateRevenueData = (in_variants) => {
    if(in_variants==null){
      in_variants = variants
    }
    const options = { month:"long", day: 'numeric' };

    let labels = []
    for(var i = 0; i < in_variants.length; i++){
      for(var j = 0; j < in_variants[i].revenue_series.length; j++){
        //month to index
        const index = new Date(in_variants[i].revenue_series[j].index);
        const date = index.toLocaleDateString(undefined,options).split(" ")
        const label = date[0].slice(0,3) + " " + date[1]
        if(!labels.includes(label)){
          labels.push(label);
        }
      }
    }
    let data = []
    //have to fix
    let variant_data = []
    let sum = 0;
    for(var i = 0; i < in_variants[0].revenue_series.length; i++){
        for(var j = 0; j < in_variants.length; j++){
          sum += in_variants[j].revenue_series[i].value      
        }
        variant_data.push(sum)
    }
    data.push(variant_data)

    let price_before = []

    for(var i = 0; i < in_variants.length; i++){
      let sum = 0
      //must change to 
      if (in_variants[i].price > 0){
        for(var j = 0; j < in_variants[i].revenue_series.length; j++){
          sum += in_variants[i].revenue_series[j].value*(100/in_variants[i].customer_percentage)
          price_before.push(sum)
        }
        break
      }
    }
    data.push(price_before)
    let dataObj = {
      labels: labels,
      series: data
    }
    console.log(dataObj)
    setRevenueData(dataObj)
  }


  const generateSalesData = (in_variants) => {
    if(in_variants==null){
      in_variants = variants
    }
    const options = {  month: 'long' };

    let labels = []
    for(var i = 0; i < in_variants.length; i++){
      for(var j = 0; j < in_variants[i].revenue_series.length; j++){
        //month to index
        const index = new Date(in_variants[i].revenue_series[j].index);
        const label = index.toLocaleDateString(undefined,options).slice(0,3)
        if(!labels.includes(label)){
          labels.push(label);
        }
      }
    }
    console.log(labels)
    let data = []
    //have to fix
    for(var i = 0; i < in_variants.length; i++){
        let variant_data = []
        for(var j = 0; j < in_variants[i].revenue_series.length; j++){
          //month to index
          const index = new Date(in_variants[i].volume_series[j].index);
          const label = index.toLocaleDateString(undefined,options).slice(0,3)
          if(labels[j] == label){
            variant_data.push(in_variants[i].volume_series[j].value);
          }
      }
       data.push(variant_data)
    }

    let dataObj = {
      labels: labels,
      series: data
    }
    console.log(dataObj)
    setSalesData(dataObj)
  }

    let total_volume = calculateVolume(variants)
    let total_revenue = calculateRevenue(variants)
    let best_price = calculateBestPrice(variants)
    console.log(inputs)
    return (
      <div className="content">
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
                Are you sure you want to edit the campaign?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button fill onClick={() => setShow(false)}>No</Button>
              <Button fill onClick={() => handleSubmit(true)}>Yes!</Button>
            </Modal.Footer>
          </Modal>
        <Container fluid>
          <Row>
            <Col lg={4} sm={6}>
              <StatsCard
                bigIcon={<img src={volume} className="mb-3"/>}
                statsText="Volume"
                statsValue={total_volume}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText={"Updated "+generateDate(campaign.updated_at)}
              />
            </Col>
            <Col lg={4} sm={6}>
              <StatsCard
                bigIcon={<img src={revenue} className="mb-3"/>}
                statsText="Revenue"
                statsValue={total_revenue}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText={"Updated "+generateDate(campaign.updated_at)}
              />
            </Col>
            <Col lg={4} sm={6}>
              <StatsCard
                bigIcon={<img src={price} className="mb-3"/>}
                statsText="Best Price"
                statsValue={best_price}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText={"Updated "+generateDate(campaign.updated_at)}
              />
            </Col>

          </Row>
          <Row>
            <Col md={12}>
              <Card
                statsIcon="fa fa-clock-o"
                id="chartHours"
                title="Revenue Summary"
                category="Aggregate Daily Revenue"
                stats={"Updated "+generateDate(campaign.updated_at)}
                content={
                  <div className="ct-chart" style={{height:"50vh"}}>
                    <ChartistGraph
                      data={revenueData}
                      type="Line"
                      options = {optionsSales}
                      responsiveOptions={responsiveSales}
                      listener={{"draw" : function(data) {
                        var seq = 0,
                            delays = 80,
                            durations = 500;

                        if(data.type === 'point') {
                        data.element.animate({
                          x1: {
                            begin: seq * delays,
                            dur: durations,
                            from: data.x - 10,
                            to: data.x,
                            easing: 'easeOutQuart'
                          },
                          x2: {
                            begin: seq * delays,
                            dur: durations,
                            from: data.x - 10,
                            to: data.x,
                            easing: 'easeOutQuart'
                          },
                          opacity: {
                            begin: seq * delays,
                            dur: durations,
                            from: 0,
                            to: 1,
                            easing: 'easeOutQuart'
                          }
                        });
                      }
                      else if(data.type === 'line' || data.type === 'area') {
                          data.element.animate({
                            d: {
                              begin: durations*1.5 * data.index,
                              dur: durations*1.5,
                              from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                              to: data.path.clone().stringify(),
                              easing: Chartist.Svg.Easing.easeOutQuint
                            }
                          });
                        }}}}
                    />
                  </div>
                }
                legend={
                  <div style={{textAlign: "center", display: "flex",justifyContent: "center",alignItems: "center"}}>
                    {createLegend(legendSales)}
                  </div>
                }
              />
            </Col>
            </Row>
            <Row>
            <Col md={12}>
              <Card
                id="chartActivity"
                title="Volume"
                category="All products including Taxes"
                stats={"Updated "+generateDate(campaign.updated_at)}
                statsIcon="fa fa-clock-o"
                content={
                  <div className="ct-chart" style={{height:"50vh"}}>
                    <ChartistGraph
                      data={salesData}
                      type="Bar"
                      options={optionsBar}
                      responsiveOptions={responsiveBar}
                      listener={
                        {"draw" : function(data) {
                          var seq = 0,
                            delays = 80,
                            durations = 500;

                        if(data.type === 'bar') {
                        data.element.animate({
                          opacity: {
                            begin: seq * delays,
                            dur: durations,
                            from: 0,
                            to: 1,
                            easing: 'easeOutQuart'
                          },
                          y2: {
                              begin:seq *delays,
                              dur: durations*3,
                              from: data.y1,
                              to: data.y2,
                              easing: 'easeOutQuart'
                          },
                        });
                      }
                    }}}
                    />
                  </div>
                }
                legend={
                  <div style={{textAlign: "center", display: "flex",justifyContent: "center",alignItems: "center"}}>
                    {createLegend(legendBar)}
                  </div>
                }
              />
            </Col>
          </Row>
        </Container>
        <Container fluid>
        <Card
          title="Edit Profile"
          content={
            <form>
              <FormGroup>
                        <FormLabel>Min Price</FormLabel>
                          <FormControl {...props} name="minPrice" type= "number" bsClass="form-control" placeholder="Enter a price" min={0} value={inputs.minPrice} onChange={handleOnChange}/>
                        <FormLabel>Max Price</FormLabel>
                          <FormControl {...props} name="maxPrice" type= "number" bsClass="form-control" placeholder="Enter a price" min={0} value={inputs.maxPrice}  onChange={handleOnChange}/>
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
                        className="mt-3 ml-2 mr-5" range min={0} max={100} value={inputs.aggression} 
                        onChange={(val) => setInputs({...inputs,aggression: val})}/>
                      </div>
                        </Col>
                    </Row>
              </FormGroup>   
              <Button bsStyle="info" pullRight fill onClick={() => handleSubmit(false)}>
                Update Campaign
              </Button>
              <div className="clearfix" />
            </form>
          }
        />
        </Container>
      </div>
    );
}

export default Product;

