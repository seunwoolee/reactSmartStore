import React, {Component, useState} from "react";
// @material-ui/core components
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import CustomInput from "../../components/CustomInput/CustomInput.js";
import Button from "../../components/CustomButtons/Button.js";
import Card from "../../components/Card/Card.js";
import CardHeader from "../../components/Card/CardHeader.js";
import CardAvatar from "../../components/Card/CardAvatar.js";
import CardBody from "../../components/Card/CardBody.js";
import CardFooter from "../../components/Card/CardFooter.js";
import Table from "../../components/Table/Table.js";
import axios from 'axios'
import avatar from "assets/img/faces/marc.jpg";
import FormControl from "@material-ui/core/FormControl";

const styles = theme => ({
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  },
  searchBtn : {
    marginTop: "20px"
  },
  spinner: {
    color: "#4ee811"
  }
});

class Search extends Component{

  state = {
    form: {
      storeName: {
        value: '',
        valid: false,
        validation: {
          required: true
        },
      },
      searchName: {
        value: '',
        valid: false,
        validation: {
          required: true
        },
      },
    },
    formIsValid: false,
    loading: false,
    resultArray: null,
    headers: {
      'x-api-key': '7VHHvq94Oh8lmtk1NbVM87JuwCOASBuE7JuTREaB',
      'Content-Type': 'application/json'
    }
  };

  checkValidity(value, rules){
    let isValid = true;

    if(rules.required) {
      isValid = value.trim() !== '' && isValid
    }

    return isValid
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedForm = {
      ...this.state.form
    };
    updatedForm[inputIdentifier].value = event.target.value;
    updatedForm[inputIdentifier].valid = this.checkValidity(updatedForm[inputIdentifier].value,updatedForm[inputIdentifier].validation);

    let formIsValid = true;
    for (let inputIdentifiers in updatedForm) {
      formIsValid = updatedForm[inputIdentifiers].valid && formIsValid
    }
    this.setState({form: updatedForm, formIsValid: formIsValid})
  };

  getOnetoFiveRanking = (data) => {
    return new Promise((resolve, reject)=>{
      axios.post(
          'https://vrhb4enh85.execute-api.ap-northeast-2.amazonaws.com/crawling/one',
          data,
          {headers: this.state.headers})
          .then(res=> {
            resolve(res.data.body);
          })
          .catch(error => {
            reject(error);
          })
    })
  };

  getSixtoTenRanking = (data) => {
    return new Promise((resolve, reject)=>{
      axios.post(
          'https://vrhb4enh85.execute-api.ap-northeast-2.amazonaws.com/crawling/two',
          data,
          {headers: this.state.headers})
          .then(res=> {
            resolve(res.data.body);
          })
          .catch(error => {
            reject(error);
          })
    })
  };

  getRankTable = () => {
    this.setState({loading: !this.state.loading, formIsValid: !this.state.formIsValid});
    const data = {
      "company_name":this.state.form.storeName.value,
      "keywords":this.state.form.searchName.value
    };

    Promise.all([this.getOnetoFiveRanking(data), this.getSixtoTenRanking(data)]).then((res)=>{
      this.setState({loading: !this.state.loading, formIsValid: !this.state.formIsValid})
      const resultArray = [...res[0], ...res[1]];
      if(resultArray){
        this.setState({resultArray: resultArray});
      }
    });

  };

  render() {
    const { classes } = this.props;
    let tableData = [];
    let result = null;
    if(this.state.resultArray){
      this.state.resultArray.map(result => {
        return tableData.push([result['result_company_name'], result['result_product_name'],
          result['result_product_price'], result['result_product_ranking']])
      });

      result = <Table
          tableHeaderColor="info"
          tableHead={["상호명", "상품명", "가격", "랭킹"]}
          tableData={tableData}
      />
    }

    return (
        <div>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <Card>
                <CardHeader color="primary">
                  <h4 className={classes.cardTitleWhite}>실시간 검색</h4>
                  <p className={classes.cardCategoryWhite}>스마트스토어</p>
                </CardHeader>
                <CardBody>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={5}>
                      <CustomInput
                          error={!this.state.form.storeName.valid}
                          success={this.state.form.storeName.valid}
                          inputProps={{
                            disabled: this.state.loading,
                            value: this.state.form.storeName.value,
                            onChange: (event) =>this.inputChangedHandler(event, 'storeName')
                          }}
                          labelText="상호명"
                          id="storeName"
                          formControlProps={{
                            fullWidth: true,
                          }}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={5}>
                      <CustomInput
                          error={!this.state.form.searchName.valid}
                          success={this.state.form.searchName.valid}
                          inputProps={{
                            disabled: this.state.loading,
                            value: this.state.form.searchName.value,
                            onChange: (event) =>this.inputChangedHandler(event, 'searchName')
                          }}
                          labelText="검색어"
                          id="searchName"
                          formControlProps={{
                            fullWidth: true
                          }}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <Button
                              onClick={this.getRankTable}
                              disabled={!this.state.formIsValid}
                              className={classes.searchBtn}
                              size={"lg"}
                              color="primary">
                        {this.state.loading ? <CircularProgress className={classes.spinner} /> : '검색'}
                      </Button>
                    </GridItem>
                  </GridContainer>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
              <Card>
                <CardHeader color="info">
                  <h4 className={classes.cardTitleWhite}>검색 결과</h4>
                </CardHeader>
                <CardBody>
                  {result}
                </CardBody>
              </Card>
            </GridItem>
          </GridContainer>
        </div>
    );
  }

}

export default withStyles(styles)(Search)
