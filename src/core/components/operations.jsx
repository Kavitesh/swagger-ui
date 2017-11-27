import React from "react"
import PropTypes from "prop-types"
import { helpers } from "swagger-client"
import { createDeepLinkPath } from "core/utils"
import { show } from "core/utils"
import { showHide } from "core/utils"
import { showHideChild } from "core/utils"
import { sidebarLoad} from "core/utils"
const { opId } = helpers

export default class Operations extends React.Component {

  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired
  };

  render() {
  
    let {
      specSelectors,
      specActions,
      oas3Actions,
      getComponent,
      layoutSelectors,
      layoutActions,
      authActions,
      authSelectors,
      getConfigs,
      fn
    } = this.props

    let taggedOps = specSelectors.taggedOperations()

    let Models = getComponent("Models", true)
    const Operation = getComponent("operation")
    const Collapse = getComponent("Collapse")
    const Markdown = getComponent("Markdown")

    let info = specSelectors.info()
	
    let url = specSelectors.url()
    let basePath = specSelectors.basePath()
    let host = specSelectors.host()
    let externalDocs = specSelectors.externalDocs()
    let Info = getComponent("info")
	
    let showSummary = layoutSelectors.showSummary()
    let {
      docExpansion,
      displayOperationId,
      displayRequestDuration,
      maxDisplayedTags,
      deepLinking
    } = getConfigs()

    const isDeepLinkingEnabled = deepLinking && deepLinking !== "false"

    let filter = layoutSelectors.currentFilter()

    if (filter) {
      if (filter !== true) {
        taggedOps = taggedOps.filter((tagObj, tag) => {
          return tag.indexOf(filter) !== -1
        })
      }
    }

    if (maxDisplayedTags && !isNaN(maxDisplayedTags) && maxDisplayedTags >= 0) {
      taggedOps = taggedOps.slice(0, maxDisplayedTags)
    }

    return (
      <div>
  
  <aside className='sidebar'>
					<div className="sidebar-root-item sidebar-root-item-button" onClick={show.bind(null,"info","sidebar-info")} id="sidebar-info">Overview		</div>
	{
	
		taggedOps.map( (tagObj, tag) => {
              let operations = tagObj.get("operations")
              let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
			return(
					<div key={tag} className={"parent-"+ tag + " sidebar-root-item"}>
          <span className="sidebar-root-item-fold" onClick={showHideChild.bind(null,tag,"sidebar-"+tag)} id={"sidebar-"+tag}>{tag}</span>{
						operations.map( op => {
						
							const path = op.get("path", "")
							const method = op.get("method", "")
							const operationId =
							op.getIn(["operation", "operationId"]) || op.getIn(["operation", "__originalOperationId"]) || opId(op.get("operation"), path, method) || op.get("id")
              
              const isShownKey = ["operations", createDeepLinkPath(tag), createDeepLinkPath(operationId)]
              
              return (
							<a className="opblock-hidden sidebar-item sidebutton" key={operationId} name={operationId} 
              href={isDeepLinkingEnabled ? `#/${isShownKey[1]}/${isShownKey[2]}` : null} onClick={show.bind(null,isShownKey,"sidebar-"+isShownKey.join("-"))} id={"sidebar-"+isShownKey.join("-")}>{operationId}</a>
              )
						}).toArray()
						}
						
            </div>
			)
		}).toArray()
		
		}
	</aside>
  <section className="main-section">
		{ info.count() ? (
                  <Info info={ info } url={ url } host={ host } basePath={ basePath } externalDocs={externalDocs} getComponent={getComponent}/>
                ) : null }
        <div>
          {
            taggedOps.map( (tagObj, tag) => {
              let operations = tagObj.get("operations")
              let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
              let tagExternalDocsDescription = tagObj.getIn(["tagDetails", "externalDocs", "description"])
              let tagExternalDocsUrl = tagObj.getIn(["tagDetails", "externalDocs", "url"])

              let isShownKey = ["operations-tag", createDeepLinkPath(tag)]
              let showTag = layoutSelectors.isShown(isShownKey, docExpansion === "full" || docExpansion === "list")

              return (
                <div className={showTag ? "opblock-tag-section is-open" : "opblock-tag-section"} key={"operation-" + tag}>


                  <Collapse isOpened={showTag}>
                    {
                      operations.map( op => {

                        const path = op.get("path", "")
                        const method = op.get("method", "")
                        const jumpToKey = `paths.${path}.${method}`

                        const operationId =
                        op.getIn(["operation", "operationId"]) || op.getIn(["operation", "__originalOperationId"]) || opId(op.get("operation"), path, method) || op.get("id")
                        const isShownKey = ["operations", createDeepLinkPath(tag), createDeepLinkPath(operationId)]

                        const allowTryItOut = specSelectors.allowTryItOutFor(op.get("path"), op.get("method"))
                        const response = specSelectors.responseFor(op.get("path"), op.get("method"))
                        const request = specSelectors.requestFor(op.get("path"), op.get("method"))

                        return <Operation
                          {...op.toObject()}

                          isShownKey={isShownKey}
                          jumpToKey={jumpToKey}
                          showSummary={showSummary}
                          key={isShownKey}
                          response={ response }
                          request={ request }
                          allowTryItOut={allowTryItOut}

                          displayOperationId={displayOperationId}
                          displayRequestDuration={displayRequestDuration}

                          specActions={ specActions }
                          specSelectors={ specSelectors }

                          oas3Actions={oas3Actions}

                          layoutActions={ layoutActions }
                          layoutSelectors={ layoutSelectors }

                          authActions={ authActions }
                          authSelectors={ authSelectors }

                          getComponent={ getComponent }
                          fn={fn}
                          getConfigs={ getConfigs }
                        />
                      }).toArray()
                    }
                  </Collapse>
                </div>
                )
            }).toArray()
          }

          { taggedOps.size < 1 ? <h3> No operations defined in spec! </h3> : null }
		  
		  
        </div>
		</section>

    </div>
    
    )
    
  }

}

Operations.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
