import React from "react"
import PropTypes from "prop-types"
import { helpers } from "swagger-client"
import { createDeepLinkPath } from "core/utils"
import { show } from "core/utils"
import { showHide } from "core/utils"
import { showHideChild } from "core/utils"
import { sidebarLoad } from "core/utils"
const { opId } = helpers


export default class Operations extends React.Component {

  constructor(props) {
    super(props);
    this.state = { searchValue: '', searching: false, searchPlaceHolder: "Search" };

    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchClose = this.handleSearchClose.bind(this);
    this.handleSearchFocus = this.handleSearchFocus.bind(this);
    this.handleSearchBlur = this.handleSearchBlur.bind(this);
  }

  handleSearch(event) {
    if (event.target.value.length > 2) {
      this.setState({ searchValue: event.target.value, searching: true, searchPlaceHolder: "" });
    } else {
      this.setState({ searchValue: event.target.value, searching: false, searchPlaceHolder: "" });
    }
  }

  handleSearchClose(event) {
    this.setState({ searchValue: '', searching: false, searchPlaceHolder: "Search" });
  }

  handleSearchFocus(event) {
    this.setState({ searchValue: this.state.searchValue, searching: this.state.searching, searchPlaceHolder: "" });
  }

  handleSearchBlur(event) {
    if (this.state.searching) {
      this.setState({ searchValue: this.state.searchValue, searching: this.state.searching, searchPlaceHolder: "Search" });
    } else {
      this.setState({ searchValue: "", searching: this.state.searching, searchPlaceHolder: "Search" });
    }

  }

  showContent(key, id, activeId) {
    var all = document.getElementsByClassName("opblock-show");
    for (var i = 0; i < all.length; i++) {
      if (!all[i].classList.contains("opblock-hidden")) {
        all[i].classList.add("opblock-hidden");
      }
    }
    var x;
    if (key == "info" || key == "models") {
      x = document.getElementsByClassName(key)[0];
      history.replaceState({}, key, `?${key}`);
    } else {
      x = document.getElementById(key.join("-"));
      var url = `?${key[1]}/${key[2]}`;
      history.replaceState({}, `${key[2]}`, url);
    }
    x.classList.remove("opblock-hidden");

    var selected = document.getElementsByClassName("active-tab")[0];
    if (selected) {
      selected.classList.remove("active-tab");
    }
    var active = document.getElementById(activeId);
    if (active) {
      active.classList.add("active-tab");
    }
  }

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

    let somethingShown = false;
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
      <div className="main-container">

        <aside className='sidebar-black' key="sidebar-black">
          <section className="search-section">
          <div  className={this.state.searching ? "black-search-box black-searching":"black-search-box"}> 
          <input type="text" value={this.state.searchValue} onChange={this.handleSearch} placeholder={this.state.searchPlaceHolder}
onFocus={this.handleSearchFocus} onBlur={this.handleSearchBlur}></input>
          <button className="search-close" onClick={this.handleSearchClose}>X</button>
          </div>

          
          <div className={this.state.searching ? "search-list":"opblock-hidden"}>
            <ul > 
              {
                taggedOps.map((tagObj, tag) => {
                  let operations = tagObj.get("operations")
                  let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
                  let isShownKey = ["operations-tag", createDeepLinkPath(tag)]
                  let showTag = layoutSelectors.isShown(isShownKey)
                  return (
                    operations.map(op => {

                      const path = op.get("path", "")
                      const method = op.get("method", "")
                      const operationId =
                        op.getIn(["operation", "operationId"]) || op.getIn(["operation", "__originalOperationId"]) || opId(op.get("operation"), path, method) || op.get("id")

                      const isShownKey = ["operations", createDeepLinkPath(tag), createDeepLinkPath(operationId)]
                      let showOp = layoutSelectors.isShown(isShownKey)
                      if (showOp) {
                        somethingShown = true;
                      }
                      return (
                        <li className={isShownKey[2].toLowerCase().includes(this.state.searchValue.toLowerCase()) ? "" : "opblock-hidden"} key={"search-" + operationId} name={"search-" + operationId}>
                          <a onClick={this.showContent.bind(this, isShownKey, "sidebar-" + isShownKey.join("-"), "sidebar-" + tag)} id={"sidebar-" + isShownKey.join("-")}>
                            {operationId}
                          </a>
                        </li>

                      )
                    }).toArray())
                })
              }
            </ul>
            </div>
</section>
          <div className={window.location.href.indexOf("?info") > -1 ? "tab-black active-tab" : "tab-black"} id="sidebar-info">

            <div className="tab-icon" onClick={this.showContent.bind(this, "info", "sidebar-info", "sidebar-info")} >
              <i className="fa fa-home" aria-hidden="true"></i>
              <h6 className="tab-title">Overview</h6>
            </div>
          </div>
          {
            taggedOps.map((tagObj, tag) => {

              let operations = tagObj.get("operations")
              let icon = tagObj.getIn(["tagDetails", "icon"], null)
              return (
                <div className={window.location.href.indexOf(`?${tag}/`) > -1 ? "tab-black active-tab" : "tab-black"} id={"sidebar-" + tag} key={"sidebar-" + tag}>

                  <div className="tab-icon">
                    <i className={icon ? icon : "fa fa-cogs"} aria-hidden="true"></i>
                    <h6 className="tab-title">{tag}</h6>
                  </div>

                  <ul className="tab-sub-items">
                    {
                      operations.map(op => {
                        const path = op.get("path", "")
                        const method = op.get("method", "")
                        const operationId =
                          op.getIn(["operation", "operationId"]) || op.getIn(["operation", "__originalOperationId"]) || opId(op.get("operation"), path, method) || op.get("id")
                        const isShownKey = ["operations", createDeepLinkPath(tag), createDeepLinkPath(operationId)]
                        let showOp = window.location.href.indexOf(`?${isShownKey[1]}/${isShownKey[2]}`) > -1//layoutSelectors.isShown(isShownKey)
                        if (showOp) {
                          somethingShown = true;
                        }
                        return (
                          <li key={"sidebar-" + isShownKey.join("-")}>
                            <a onClick={this.showContent.bind(this, isShownKey, "sidebar-" + isShownKey.join("-"), "sidebar-" + tag)} id={"sidebar-" + isShownKey.join("-")} >
                              {operationId}
                            </a>
                          </li>
                        )
                      }).toArray()
                    }
                  </ul>
                </div>
              )
            }).toArray()
          }
        </aside>

        {/* <aside className='sidebar '>
          <div  className={this.state.searching ? "search-box searching":"search-box"}> 
          <input type="text" value={this.state.searchValue} onChange={this.handleSearch} placeholder={this.state.searchPlaceHolder}
onFocus={this.handleSearchFocus} onBlur={this.handleSearchBlur}></input>
          <button className="search-close" onClick={this.handleSearchClose}>X</button>
          </div>
          <div className={this.state.searching ? "opblock-hidden " : "sidebar-list"}>
            <a className={window.location.href.indexOf("?info")>-1 ? "sidebar-index sidebar-root-item sidebar-root-item-button" : "sidebar-root-item sidebar-root-item-button"} onClick={show.bind(null, "info", "sidebar-info")} id="sidebar-info">Overview		</a>
            {
              taggedOps.map((tagObj, tag) => {

                let operations = tagObj.get("operations")
                let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
                let icon = tagObj.getIn(["tagDetails", "description"], null)

                console.log(icon)
                let isShownKey = ["operations-tag", createDeepLinkPath(tag)]
                let showTag = window.location.href.indexOf(`?${isShownKey[1]}`)>-1//layoutSelectors.isShown(isShownKey)
                return (

                  <div key={tag} className={showTag ? "sidebar-index-isopen parent-" + tag + " sidebar-root-item" : "parent-" + tag + " sidebar-root-item"}>

                    <a className="sidebar-root-item-fold" onClick={showHideChild.bind(null, tag, "sidebar-" + tag)} id={"sidebar-" + tag}>{tag}</a>{
                      operations.map(op => {

                        const path = op.get("path", "")
                        const method = op.get("method", "")
                        const operationId =
                          op.getIn(["operation", "operationId"]) || op.getIn(["operation", "__originalOperationId"]) || opId(op.get("operation"), path, method) || op.get("id")

                        const isShownKey = ["operations", createDeepLinkPath(tag), createDeepLinkPath(operationId)]
                        let showOp = window.location.href.indexOf(`?${isShownKey[1]}/${isShownKey[2]}`)>-1//layoutSelectors.isShown(isShownKey)
                        if (showOp) {
                          somethingShown = true;
                        }
                        return (
                          <a className={showOp ? "sidebar-item sidebutton sidebar-index" : "opblock-hidden sidebar-item sidebutton"} key={operationId} name={operationId}
                           onClick={show.bind(null, isShownKey, "sidebar-" + isShownKey.join("-"))} id={"sidebar-" + isShownKey.join("-")}>{operationId}</a>

                        )
                      }).toArray()


                    }

                  </div>
                )

              }).toArray()

            }
          </div>
          <div className={!this.state.searching ? "opblock-hidden " : "sidebar-result"}>
            {
              taggedOps.map((tagObj, tag) => {
                let operations = tagObj.get("operations")
                let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
                let isShownKey = ["operations-tag", createDeepLinkPath(tag)]
                let showTag = layoutSelectors.isShown(isShownKey)
                return (
                  operations.map(op => {

                    const path = op.get("path", "")
                    const method = op.get("method", "")
                    const operationId =
                      op.getIn(["operation", "operationId"]) || op.getIn(["operation", "__originalOperationId"]) || opId(op.get("operation"), path, method) || op.get("id")

                    const isShownKey = ["operations", createDeepLinkPath(tag), createDeepLinkPath(operationId)]
                    let showOp = layoutSelectors.isShown(isShownKey)
                    if (showOp) {
                      somethingShown = true;
                    }
                    return (
                      <a className={isShownKey[2].toLowerCase().includes(this.state.searchValue.toLowerCase()) ? "sidebar-item sidebutton" : "opblock-hidden"} key={"search-" + operationId} name={"search-" + operationId}
                        onClick={show.bind(null, isShownKey, "sidebar-" + isShownKey.join("-"))} id={"sidebar-" + isShownKey.join("-")}>{operationId}</a>

                    )
                  }).toArray())


              }

              )

            }
          </div>
        </aside> */}


        <section className="main-section">
          <div className={!somethingShown || layoutSelectors.isShown(["operations-tag", createDeepLinkPath("info")]) ? "info opblock-show opblock opblock-options" : "info opblock-show opblock opblock-options opblock-hidden"}>
            {
              info.count() ? (
                <Info info={info} url={url} host={host} basePath={basePath} externalDocs={externalDocs} getComponent={getComponent} />
              ) : null}
          </div>
          {
            taggedOps.map((tagObj, tag) => {
              let operations = tagObj.get("operations")
              let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
              let tagExternalDocsDescription = tagObj.getIn(["tagDetails", "externalDocs", "description"])
              let tagExternalDocsUrl = tagObj.getIn(["tagDetails", "externalDocs", "url"])

              let isShownKey = ["operations-tag", createDeepLinkPath(tag)]

              let showTag = layoutSelectors.isShown(isShownKey)
              return (
                <div className="opblock-tag-section" key={"operation-" + tag}>
                  {
                    operations.map(op => {

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
                        {...op.toObject() }

                        isShownKey={isShownKey}
                        jumpToKey={jumpToKey}
                        showSummary={showSummary}
                        key={isShownKey}
                        response={response}
                        request={request}
                        allowTryItOut={allowTryItOut}

                        displayOperationId={displayOperationId}
                        displayRequestDuration={displayRequestDuration}

                        specActions={specActions}
                        specSelectors={specSelectors}

                        oas3Actions={oas3Actions}

                        layoutActions={layoutActions}
                        layoutSelectors={layoutSelectors}

                        authActions={authActions}
                        authSelectors={authSelectors}

                        getComponent={getComponent}
                        fn={fn}
                        getConfigs={getConfigs}
                      />
                    }).toArray()
                  }
                </div>
              )
            }).toArray()
          }
          {taggedOps.size < 1 ? <h3> No operations defined in spec! </h3> : null}
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
