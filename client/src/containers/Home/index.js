import React from "react"
import axios from "axios"
import { saveTemplate } from "../../requests"
import {
  Jumbotron,
  Container,
  Tabs,
  Tab,
  Row,
  Col,
  Button,
  Spinner,
} from "react-bootstrap"
import CustomModal from "../../components/CustomModal"
import MockList from "../../components/MockList"
import TestApplicationDetail from "../../components/TestApplicationDetail"
import CustomToast from "../../components/CustomToast"
import TipsNTricks from "../../components/TipsNTricks"
import CustomDropzone from "../../components/CustomDropzone"
import Tips from "./Tips"
import app_url from "../../paths"
export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      get: {
        endpoint: "",
        response: {},
        method: "get",
      },
      modalValues: {},
      showModal: false,
      apis: [],
      showLoader: true,
      selectedApi: {},
      apiCheck: {},
      deletionStatus: null,
      showToast: true,
      toastBody: "",
      isgetResponseBodyValid: "",
      tip: "",
    }
    this.defaultModalValues = {
      type: "",
      header: "",
      desc: "",
      secondary: "",
    }
    this.save = this.save.bind(this)
    this.onHide = this.onHide.bind(this)
    this.getApis = this.getApis.bind(this)
    this.cascade = this.cascade.bind(this)
    this.cascadeWarning = this.cascadeWarning.bind(this)
    this.setSelected = this.setSelected.bind(this)
    this.deleteWarning = this.deleteWarning.bind(this)
    this.deleteSelectedRequest = this.deleteSelectedRequest.bind(this)
    this.onToastClose = this.onToastClose.bind(this)
    this.download = this.download.bind(this)
    this.upload = this.upload.bind(this)
    this.homeRef = React.createRef()
  }

  componentDidMount() {
    this.getApis()
  }

  async getApis() {
    let randomNumber = Math.floor(Math.random() * Tips.length)
    let path = app_url + "getall"
    const apis = await axios
      .get(path, {
        headers: {
          "content-type": "application/json",
        },
      })
      .then(function (response) {
        console.log(response)
        if (response.data === "") {
          return {}
        }
        return response
      })
      .catch(function (error) {
        console.log(error)
        return "error"
      })
    if (apis === "error") {
      this.setState({
        apis: {},
        showLoader: false,
        selectedApi: {},
        deletionStatus: null,
        modalValues: this.defaultModalValues,
        showModal: false,
        showToast: true,
        toastBody: "Error occured, endpoints could not be retrieved !",
        tip: Tips[randomNumber],
      })
    } else {
      this.setState({
        apis,
        showLoader: false,
        selectedApi: {},
        deletionStatus: null,
        modalValues: this.defaultModalValues,
        showModal: false,
        showToast: true,
        toastBody: "Successfuly fetched mock endpoints.",
        tip: Tips[randomNumber],
      })
    }
  }

  validate(template) {
    try {
      template.endpoint = template.endpoint.toLocaleLowerCase("en-US")
      template.endpoint = template.endpoint.replace(/\s/g, "")

      template.response = JSON.parse(template.response)
      if (template.request) {
        template.request = JSON.parse(template.request)
      }
      console.log("template inside validate returning --> ", template)

      return template
    } catch (error) {
      console.log(error)
    }
    return false
  }

  save(type) {
    const isValidBoolean = this.validate(this.state[type])
    console.log(isValidBoolean)

    if (isValidBoolean) {
      const toBeSaved = { body: isValidBoolean }
      console.log(toBeSaved)
      saveTemplate(toBeSaved)
      this.clearInputs()
      this.getApis()
    } else {
      this.setState({
        showToast: true,
        toastBody: "Please Correct Your Json Object !",
      })
    }
  }


  onHide() {
    const modalValues = {
      type: "",
      header: "",
      desc: "",
      secondary: "",
    }
    this.setState({ modalValues, showModal: false })
  }

  cascadeWarning() {
    const modalValues = {
      type: "Warning",
      header: "Cascade",
      desc:
        "You are about to delete every application you added. Are you sure ? This cannot be reverted.",
      secondary: "cascade",
    }
    this.setState({ modalValues, showModal: true })
  }

  async cascade() {
    this.onHide()
    let path = app_url + "cascade"
    const success = await axios
      .get(path, {
        headers: {
          "content-type": "application/json",
        },
      })
      .then(function (response) {
        console.log(response)
        return response
      })
      .catch(function (error) {
        console.log(error)
        return error
      })
    if (success.data) {
      this.getApis()
    } else {
      this.setState({
        showToast: true,
        toastBody:
          "Could not delete - Pleade create an Issue on Github - Huseyinnurbaki/mocktail",
      })
    }
  }

  setSelected(selectedApi) {
    this.setState({ selectedApi, apiCheck: {}, deletionStatus: null })
  }

  async deleteSelectedRequest() {
    const endpoint = app_url + "delete/" + this.state.selectedApi.filename

    const deletionStatus = await axios
      .get(endpoint, {
        headers: {
          "content-type": "application/json",
        },
      })
      .then(function (response) {
        console.log(response)
        if (response.data === "") {
          return {}
        }
        return response
      })
      .catch(function (error) {
        console.log(error)
        return {}
      })
    console.log(deletionStatus)
    if (
      deletionStatus.data &&
      deletionStatus.data.status &&
      deletionStatus.data.status === "success"
    ) {
      this.getApis()
    } else {
      this.setState({
        deletionStatus: deletionStatus.status,
        modalValues: this.defaultModalValues,
        showModal: false,
        showToast: true,
        toastBody: "Could not delete the item. !",
      })
    }
  }

  deleteWarning() {
    const modalValues = {
      type: "Warning",
      header: "Delete",
      desc:
        "You are about to delete selected api. Are you sure ? You can revert it if you wish.",
      secondary: "deleteSelectedRequest",
    }
    this.setState({ modalValues, showModal: true })
  }

  onToastClose() {
    this.setState({ showToast: false, toastBody: "" })
  }

  async download() {
    const link = document.createElement("a")
    link.href =
      "itms-services://?action=download-manifest&url=https://192.168.1.33:7080/manifest.plist"
    link.download = "manifest.plist"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async upload(fileValue) {
    let bodyFormData = new FormData()
    bodyFormData.set("userName", "Fred")
    bodyFormData.append("app", fileValue)

    let path = app_url + "upload"
    const up = await axios
      .post(path, bodyFormData, {
        headers: { "content-type": "multipart/form-data" },
      })
      .then(function (response) {
        console.log(response)
        if (response.data === "") {
          return {}
        }
        return response
      })
      .catch(function (error) {
        console.log(error)
        return {}
      })

    if (up.data) {
      this.getApis()
    } else {
      this.setState({
        showToast: true,
        toastBody: "Your jsonfile is not valid !",
      })
    }
  }

  render() {
    return (
      <div style={{ backgroundColor: "rgb(250, 250, 250)" }}>
        <Container fluid style={{ width: "80%" }}>
          <CustomToast
            onToastClose={this.onToastClose}
            showToast={this.state.showToast}
            toastBody={this.state.toastBody}
          />
          <CustomModal
            show={this.state.showModal}
            vals={this.state.modalValues}
            onHide={this.onHide}
            cascade={this.cascade}
            deleteSelectedRequest={this.deleteSelectedRequest}
          />

          <Tabs
            id="controlled-tab-example"
            activeKey={this.state.activeKey}
            onSelect={(key) => this.setState({ tab: key })}
          >
            <Tab eventKey="upload" title="Upload">
              <Jumbotron className="jumboTop">
                <Row>
                  <Col>
                    <TipsNTricks tip={this.state.tip} />
                  </Col>
                  <Col>
                    <CustomDropzone upload={this.upload} />
                  </Col>
                </Row>
              </Jumbotron>
            </Tab>
            <Tab eventKey="export" title="Export">
              <Jumbotron className="jumboTop">
                <Row>
                  <Col>
                    <h1 className="h1dr">Export</h1>
                    <h3 className="h2dr">
                      You can export all mock templates into a json file to easily
                      distribute mock templates.{" "}
                    </h3>
                    <h4 className="h1dr">
                      *Later this file can be uploaded using upload tab.{" "}
                    </h4>

                    <Button
                      style={{ marginTop: "30px" }}
                      variant="danger"
                      onClick={() => this.download()}
                      size="lg"
                    >
                      Download
                    </Button>
                  </Col>
                  <Col>
                    <img
                      src="do.png"
                      style={{ height: "250px", marginTop: "80px", opacity: "0.85" }}
                      className="headerimg"
                      alt=""
                    />
                  </Col>
                </Row>
              </Jumbotron>
            </Tab>
            <Tab eventKey="secret" title="Secret">
              <Jumbotron className="jumboTop">
                <Row>
                  <Col>
                    <h1 className="h1dr">Secret</h1>
                    <h3 className="h2dr">Change the secret to deactivate previous download links.</h3>
                    <h4 className="h1dr">*This action is irreversable</h4>

                    <Button
                      style={{ marginTop: "30px" }}
                      variant="danger"
                      onClick={() => console.log("old recover tab")}
                      size="lg"
                    >
                      Recover
                    </Button>
                  </Col>
                  <Col>
                    <img
                      src="he.png"
                      style={{ height: "250px", marginTop: "80px", opacity: "0.85" }}
                      className="headerimg"
                      alt=""
                    />
                  </Col>
                </Row>
              </Jumbotron>
            </Tab>
            <Tab eventKey="archive" title="Archive">
              <Jumbotron className="jumboTop">
                <Row>
                  <Col>
                    <h1 className="h1dr">Archive</h1>
                    <h3 className="h2dr">You can recover after cascading.</h3>
                    <h4 className="h1dr">
                      *This action reverts cascade operation.Can only be used right
                      after cascade operation. If you save any template after
                      cascading, you cannot recover.
                    </h4>

                    <Button
                      style={{ marginTop: "30px" }}
                      variant="danger"
                      onClick={() => console.log("old recover tab")}
                      size="lg"
                    >
                      Recover
                    </Button>
                  </Col>
                  <Col>
                    <img
                      src="he.png"
                      style={{ height: "250px", marginTop: "80px", opacity: "0.85" }}
                      className="headerimg"
                      alt=""
                    />
                  </Col>
                </Row>
              </Jumbotron>
            </Tab>
            <Tab eventKey="cascade" title="Cascade">
              <Jumbotron className="jumboTop">
                <Row>
                  <Col>
                    <h1 className="h1dr">Cascade</h1>
                    <h3 className="h2dr">You can always make a clean start</h3>
                    <h4 className="h1dr">
                      *This action is irrevertable. Use with caution.
                    </h4>

                    <Button
                      style={{ marginTop: "30px" }}
                      variant="danger"
                      onClick={() => this.cascadeWarning()}
                      size="lg"
                    >
                      Cascade
                    </Button>
                  </Col>
                  <Col>
                    <img
                      src="exp.png"
                      style={{ height: "250px", marginTop: "80px", opacity: "0.85" }}
                      className="headerimg"
                      alt=""
                    />
                  </Col>
                </Row>
              </Jumbotron>
            </Tab>
          </Tabs>

          <Row>
            <Col>
              <Jumbotron className="jumbos">
                <Col>
                  <h1 className="h1dr">
                    {" "}
                    Total Apps{" "}
                    {this.state.apis && this.state.apis.data
                      ? this.state.apis.data.length
                      : 0}{" "}
                  </h1>
                </Col>
                {this.state.showLoader ? (
                  <Col style={{ alignSelf: "center" }}>
                    <Row style={{ justifyContent: "center" }}>
                      <Spinner
                        style={{ height: "100px", width: "100px" }}
                        animation="border"
                        variant="warning"
                      />
                    </Row>
                  </Col>
                ) : (
                  <MockList
                    apis={this.state.apis}
                    onPressAction={this.setSelected}
                  ></MockList>
                )}
              </Jumbotron>
            </Col>
            <Col>
              <Jumbotron className="jumbos">
                <TestApplicationDetail
                  disabled
                  data={this.state.selectedApi}
                  deleteSelectedRequest={this.deleteWarning}
                  deletionStatus={this.state.deletionStatus}
                  apiCheck={this.state.apiCheck}
                />
              </Jumbotron>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

// Todo validate json ekranında jsonın valid olmayan satırını yaz beautify edip.
