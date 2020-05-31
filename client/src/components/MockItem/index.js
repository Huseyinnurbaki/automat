import React from "react"
import InputGroup from "react-bootstrap/InputGroup"
import FormControl from "react-bootstrap/FormControl"
import Button from "react-bootstrap/Button"
import { Row, Col, Badge } from "react-bootstrap"

const MockItem = (props) => {
  let originalname = props.data.originalname
  const createDate = props.data.createDate
    ? new Date(parseInt(props.data.createDate)).toDateString()
    : null
  const createTime = props.data.createDate
    ? new Date(parseInt(props.data.createDate)).toTimeString()
    : null
  return (
    <dt key={props.index}>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <img src="ipa.png" style={{ height: "80px", opacity: "0.85" }} alt="" />
        </InputGroup.Prepend>
        <Col>
          <Row>
            <FormControl
              placeholder={originalname + " " + createDate}
              aria-label={originalname}
              aria-describedby="basic-addon1"
              disabled
            />
          </Row>
          <Row>
            <FormControl
              placeholder={createTime}
              aria-label={createTime}
              aria-describedby="basic-addon1"
              disabled
            />
          </Row>
        </Col>
        <InputGroup.Append>
          {!props.disabled ? (
            <Button
              onClick={
                !props.disabled ? () => props.onPressAction(props.data) : null
              }
              variant="outline-info"
            >
              Details
            </Button>
          ) : null}
        </InputGroup.Append>
      </InputGroup>
      <Col>
        <Row>
          <div>
            <h4>Tags : </h4>
          </div>
          <div>
            <Badge variant="primary">Primary</Badge>{" "}
          </div>
        </Row>
      </Col>
    </dt>
  )
}

export default MockItem
