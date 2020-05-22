import React from "react"
import InputGroup from "react-bootstrap/InputGroup"
import FormControl from "react-bootstrap/FormControl"
import Button from "react-bootstrap/Button"

const MockItem = (props) => {
  // let method = props.data.method.toString().toUpperCase()
  let bgc = "orange"
  // if (method === "GET") {
  //   bgc = "#17b027"
  //   method = method + "  ."
  // }
  let path = '/' + props.data.path
  let copypath = "http://localhost:7080/mocktail/" + props.data.path
  return (
    <dt key={props.index}>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text
            style={{ backgroundColor: bgc, color: "white", fontWeight: "600" }}
            id="basic-addon1"
          >
            {props.originalname}
          </InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder={path}
          aria-label={path}
          aria-describedby="basic-addon1"
          disabled
        />
        <InputGroup.Append>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(copypath)
            }}
            variant="outline-secondary"
          >
            Copy
          </Button>
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
    </dt>
  )
}

export default MockItem
