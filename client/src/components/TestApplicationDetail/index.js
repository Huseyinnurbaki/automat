import React from "react"
import { Col, Button } from "react-bootstrap"
import MockItem from "../MockItem"
import QRCode from "qrcode.react"

const TestApplicationDetail = (props) => {
  if (!props.data.originalname) {
    return (
      <Col style={{ minHeight: "400px" }}>
        <h1 className="h1dr">Choose Application From Left</h1>
        <img
          style={{ height: "100px", marginTop: "60px", opacity: "0.5" }}
          src="left.png"
          className="rounded mr-2"
          alt=""
        />
      </Col>
    )
  }
  const createDateTime = props.data.createDate
    ? new Date(parseInt(props.data.createDate))
    : null

  return (
    <div>
      <Col>
        <h1 className="h1dr">Application Details</h1>
        <MockItem disabled={props.disabled} data={props.data}></MockItem>
      </Col>
      <Col>
        <h5 className="h1dr">Upload Date & Time</h5>
        <h5 className="h1dr">{createDateTime.toString()}</h5>
      </Col>

      <Col>
        <QRCode
          size={200}
          value="itms-services://?action=download-manifest&url=https://192.168.1.33:7080/manifest.plist"
        />
        <Col></Col>
        <Button variant="danger" onClick={props.deleteSelectedRequest}>
          Delete
        </Button>
      </Col>
    </div>
  )
}

export default TestApplicationDetail
