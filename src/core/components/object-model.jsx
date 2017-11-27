import React, { Component, } from "react"
import PropTypes from "prop-types"
import { List } from "immutable"

const braceOpen = "{"
const braceClose = "}"

export default class ObjectModel extends Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    specSelectors: PropTypes.object.isRequired,
    name: PropTypes.string,
    isRef: PropTypes.bool,
    expandDepth: PropTypes.number,
    depth: PropTypes.number
  }

  render(){
    let { schema, name, isRef, getComponent, depth, expandDepth, ...otherProps } = this.props
    let { specSelectors } = otherProps
    let { isOAS3 } = specSelectors

    if(!schema) {
      return null
    }

    let description = schema.get("description")
    let properties = schema.get("properties")
    let additionalProperties = schema.get("additionalProperties")
    let title = schema.get("title") || name
    let requiredProperties = schema.get("required")

    const JumpToPath = getComponent("JumpToPath", true)
    const Markdown = getComponent("Markdown")
    const Model = getComponent("Model")
    const ModelCollapse = getComponent("ModelCollapse")

    const JumpToPathSection = ({ name }) => {
      const path = isOAS3 && isOAS3() ? `components.schemas.${name}` : `definitions.${name}`
      return <span className="model-jump-to-path"><JumpToPath path={path} /></span>
    }
    const collapsedContent = (<span>
        <span>{ braceOpen }</span>...<span>{ braceClose }</span>
        {
        isRef ? <JumpToPathSection name={ name }/> : ""
        }
    </span>)

    const anyOf = specSelectors.isOAS3() ? schema.get("anyOf") : null
    const oneOf = specSelectors.isOAS3() ? schema.get("oneOf") : null
    const not = specSelectors.isOAS3() ? schema.get("not") : null

    const titleEl = title && <span className="model-title">
      { isRef && schema.get("$$ref") && <span className="model-hint">{ schema.get("$$ref") }</span> }
      <span className="model-title__text">{ title }</span>
    </span>

    return <span className="model">
      <ModelCollapse title={titleEl} collapsed={ depth > expandDepth } collapsedContent={ collapsedContent }>
         <span className="brace-open object">{ braceOpen }</span>
          {
            !isRef ? null : <JumpToPathSection name={ name }/>
          }
          <span className="inner-object">
            {
              <div className="model model-margin" >
              {
                !description ? <p/>: <span style={{ color: "#999", fontStyle: "italic" }}>
                    <span>description:</span>
                    <span>
                      <Markdown source={ description } />
                    </span>
                  </span>
              }
              {
                !(properties && properties.size) ? null : properties.entrySeq().map(
                    ([key, value]) => {
                      let isDeprecated = isOAS3() && value.get("deprecated")
                      let isRequired = List.isList(requiredProperties) && requiredProperties.contains(key)
                      let propertyStyle = { verticalAlign: "top", paddingRight: "0.2em" }
                      if ( isRequired ) {
                        propertyStyle.fontWeight = "bold"
                      }

                      return (<span key={key} className={isDeprecated && "deprecated"}>
                        <span className={isRequired?"model-field-bold" : "model-field"}>
                          { key }{ isRequired && <span style={{ color: "red" }}>*</span>  }
                        </span>
                        <div className="model-field-type">
                          <Model key={ `object-${name}-${key}_${value}` } { ...otherProps }
                                 required={ isRequired }
                                 getComponent={ getComponent }
                                 schema={ value }
                                 depth={ depth + 1 } />
                        </div>
                      </span>)
                    }).toArray()
              }
              {
                !additionalProperties || !additionalProperties.size ? null
                  : <span>
                    <span>{ "< * >:" }</span>
                    <span>
                      <Model { ...otherProps } required={ false }
                             getComponent={ getComponent }
                             schema={ additionalProperties }
                             depth={ depth + 1 } />
                    </span>
                  </span>
              }
              {
                !anyOf ? null
                  : <span>
                    <span>{ "anyOf ->" }</span>
                    <span>
                      {anyOf.map((schema, k) => {
                        return <div key={k}><Model { ...otherProps } required={ false }
                                 getComponent={ getComponent }
                                 schema={ schema }
                                 depth={ depth + 1 } /></div>
                      })}
                    </span>
                  </span>
              }
              {
                !oneOf ? null
                  : <div>
                    <div>{ "oneOf ->" }</div>
                    <div>
                      {oneOf.map((schema, k) => {
                        return <div key={k}><Model { ...otherProps } required={ false }
                                 getComponent={ getComponent }
                                 schema={ schema }
                                 depth={ depth + 1 } /></div>
                      })}
                    </div>
                  </div>
              }
              {
                !not ? null
                  : <div>
                    <div>{ "not ->" }</div>
                    <div>
                      <div>
                        <Model { ...otherProps }
                               required={ false }
                               getComponent={ getComponent }
                               schema={ not }
                               depth={ depth + 1 } />
                        </div>
                    </div>
                  </div>
              }
              </div>
          }
        </span>
        <span className="brace-close">{ braceClose }</span>
      </ModelCollapse>
    </span>
  }
}
