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
import ChartistGraph from "react-chartist";
import Chartist from "chartist";
import Legend from "chartist-plugin-legend";
import { Container, Row, Col,Button } from "react-bootstrap";
import AllProducts from "./AllProducts"
import { Card } from "../shared/bootstrapdash/Card/Card.jsx";
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
import {get,post} from '../api.jsx'
import volume from '../assets/icons/volume.svg';
import revenue from '../assets/icons/revenue.svg';
import price from '../assets/icons/price.svg';
import {formatMoney,calculateRevenue,calculateVolume,calculateBestPrice} from "../utils.jsx"

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      campaigns:[],
      value: "",
      revenueData:{
        labels:[],
        series:[]
      },
      salesData:{
        labels:[],
        series:[]
      },
      items: [
            ],
    };
    this.productRef = React.createRef()
  }

  componentDidMount(){
    get('/api/campaigns/').then( res =>{
      if(res.success){
        console.log(res)
        this.setState({
          campaigns: res.campaigns
        })
        this.generateRevenueData(res.campaigns)
        this.generateSalesData(res.campaigns)
      }
    })
  }

  createLegend(json) {
    var legend = [];
    for (var i = 0; i < this.state.campaigns.length; i++) {
      var type = "fa fa-circle text-" + json["types"][i];
      legend.push(
        <div className="pr-5"style={{width:200}}>
          <span class="circle" style={{color: json["types"][i]}}></span> 
          <span>
            <p>{this.state.campaigns[i].title}</p>
          </span>
        </div>
    );
    }
    return legend;
  }

  generateRevenueData(campaigns){
    if(campaigns==null){
      campaigns = this.state.campaigns
    }
    const options = { month:"long", day: 'numeric' };

    let labels = []

    for(var i = 0; i < campaigns.length; i++){
      for(var j = 0; j < campaigns[i].revenue_series.length; j++){
        //month to index
        const index = new Date(campaigns[i].revenue_series[j].index);
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
    for(var i = 0; i < campaigns[0].revenue_series.length; i++){
        for(var j = 0; j < campaigns.length; j++){
          sum += campaigns[j].revenue_series[i].value      
        }
        variant_data.push(sum)
    }
    data.push(variant_data)

    // console.log(labels)
    // let data = []
    // //have to fix
    // for(var i = 0; i < campaigns.length; i++){
    //     let variant_data = []
    //     for(var j = 0; j < campaigns[i].revenue_series.length; j++){
    //       //month to index
    //       const index = new Date(campaigns[i].revenue_series[j].index);
    //       const label = index.toLocaleDateString(undefined,options).slice(0,3)

    //       if(labels[j] == label){
    //         variant_data.push(campaigns[i].revenue_series[j].value);
    //       }
    //   }
    //    data.push(variant_data)
    // }

    let dataObj = {
      labels: labels,
      series: data
    }
    console.log(dataObj)
    this.setState({
      revenueData: dataObj
    })
  }

  generateSalesData(campaigns){
    if(campaigns==null){
      campaigns = this.state.campaigns
    }
    const options = {  month: 'long' };

    let labels = []
    for(var i = 0; i < campaigns.length; i++){
      for(var j = 0; j < campaigns[i].revenue_series.length; j++){
        //month to index

        const index = new Date(campaigns[i].revenue_series[j].index);
        const label = index.toLocaleDateString(undefined,options).slice(0,3)
        if(!labels.includes(label)){
          labels.push(label);
        }
      }
    }
    console.log(labels)
    let data = []
    //have to fix
    for(var i = 0; i < campaigns.length; i++){
        let variant_data = []
        for(var j = 0; j < campaigns[i].revenue_series.length; j++){
          //month to index
          const index = new Date(campaigns[i].volume_series[j].index);
          const label = index.toLocaleDateString(undefined,options).slice(0,3)

          if(labels[j] == label){
            variant_data.push(campaigns[i].volume_series[j].value);
          }
      }
       data.push(variant_data)
    }

    let dataObj = {
      labels: labels,
      series: data
    }
    console.log(dataObj)
    this.setState({
      salesData: dataObj
    })
  }

  render() {
    let total_volume = calculateVolume(this.state.campaigns)
    let total_revenue = calculateRevenue(this.state.campaigns)
    let best_price = calculateBestPrice(this.state.campaigns)

    return (
      <div className="content">
        <Container fluid>
          <Row>
            <Col lg={4} sm={6}>
              <StatsCard
                bigIcon={<img src={volume} className="mb-3"/>}
                statsText="Volume"
                statsValue={total_volume}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText="Updated now"
              />
            </Col>
            <Col lg={4} sm={6}>
              <StatsCard
                bigIcon={<img src={revenue} className="mb-3"/>}
                statsText="Revenue"
                statsValue={total_revenue}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText="Updated now"
              />
            </Col>
            <Col lg={4} sm={6}>
              <StatsCard
                bigIcon={<img src={price} className="mb-3"/>}
                statsText="Revenue Increase"
                statsValue={best_price}
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText="Updated now"
              />
            </Col>

          </Row>
          <Row>
            <Col md={12}>
              <Card
                statsIcon="fa fa-clock-o"
                id="chartHours"
                title="Revenue Summary"
                category="Monthly performace"
                stats="Updated 3 minutes ago"
                content={
                  <div className="ct-chart" style={{height:"50vh"}}>
                    <ChartistGraph
                      data={this.state.revenueData}
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
                    {this.createLegend(legendSales)}
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
                category="Monthly volume performace"
                statsIcon="fa fa-clock-o"
                stats="Updated 3 minutes ago"
                content={
                  <div className="ct-chart" style={{height:"50vh"}}>
                    <ChartistGraph
                      data={this.state.salesData}
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
                    {this.createLegend(legendBar)}
                  </div>
                }
              />
            </Col>
          </Row>
        </Container>
        <div ref={this.productRef}>
          <AllProducts {...this.props} />
        </div>

      </div>
    );
  }
}

export default Dashboard;
            // <Col lg={2} sm={4} className="col-centered">
              // <Button className="text-align" style={{fontSize:70, border:0}} onClick={() => this.productRef.current.scrollIntoView({ behavior: "smooth" }) }>
                //<i className="pe-7s-bottom-arrow" />
              //</Button>
            //</Col>
