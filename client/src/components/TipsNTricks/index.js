import React from "react"
import { Col, Card } from "react-bootstrap"

const TipsNTricks = (props) => {
  return (
    <Col>
      <Col>
        <h1 className="h1dr">Upload</h1>
      </Col>
      <Col style={{ marginTop: "38px" }}>
        <Card.Title className="h1dr">
          {" "}
          Drop Your Ipa or Apk On The Right.{" "}
        </Card.Title>
      </Col>
      <Col style={{ marginTop: "38px" }}>
        <Card.Title className="h1dr"> Tips & Tricks </Card.Title>

        <Card>
          <Card.Body>{props.tip}</Card.Body>
        </Card>
      </Col>
    </Col>
  )
}

export default TipsNTricks

